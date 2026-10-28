use std::fs;
use std::path::PathBuf;
use tauri::Manager;

/// Caminho do arquivo de dados: %APPDATA%\com.founderha.aion2taskmanager\dados.json
fn data_file(app: &tauri::AppHandle) -> Result<PathBuf, String> {
    let dir = app.path().app_data_dir().map_err(|e| e.to_string())?;
    fs::create_dir_all(&dir).map_err(|e| e.to_string())?;
    Ok(dir.join("dados.json"))
}

/// Lê os dados salvos. Retorna None na primeira vez que o app abre.
#[tauri::command]
fn load_data(app: tauri::AppHandle) -> Result<Option<String>, String> {
    let path = data_file(&app)?;
    if !path.exists() {
        return Ok(None);
    }
    fs::read_to_string(&path).map(Some).map_err(|e| e.to_string())
}

/// Salva os dados com segurança: grava num arquivo temporário e depois troca,
/// guardando a versão anterior em dados.json.bak.
#[tauri::command]
fn save_data(app: tauri::AppHandle, contents: String) -> Result<(), String> {
    let path = data_file(&app)?;
    let tmp = path.with_extension("json.tmp");
    fs::write(&tmp, contents).map_err(|e| e.to_string())?;
    if path.exists() {
        let _ = fs::copy(&path, path.with_extension("json.bak"));
    }
    fs::rename(&tmp, &path).map_err(|e| e.to_string())
}

/// Grava um arquivo de texto no caminho escolhido pelo usuário (exportar backup).
#[tauri::command]
fn write_text_file(path: String, contents: String) -> Result<(), String> {
    fs::write(&path, contents).map_err(|e| e.to_string())
}

/// Lê um arquivo de texto escolhido pelo usuário (importar backup). Limite de 20 MB.
#[tauri::command]
fn read_text_file(path: String) -> Result<String, String> {
    let meta = fs::metadata(&path).map_err(|e| e.to_string())?;
    if meta.len() > 20 * 1024 * 1024 {
        return Err("Arquivo grande demais para ser um backup (mais de 20 MB).".into());
    }
    fs::read_to_string(&path).map_err(|e| e.to_string())
}

/// Guarda uma cópia de segurança em %APPDATA%\...\copias-de-seguranca\<nome>.json.
/// O nome vem do app (ex.: "antes-de-importar-20261027-2319") e só pode ter letras, números e hífens.
#[tauri::command]
fn snapshot_data(app: tauri::AppHandle, name: String, contents: String) -> Result<String, String> {
    if name.is_empty() || !name.chars().all(|c| c.is_ascii_alphanumeric() || c == '-') {
        return Err("Nome de cópia inválido.".into());
    }
    let dir = app.path().app_data_dir().map_err(|e| e.to_string())?.join("copias-de-seguranca");
    fs::create_dir_all(&dir).map_err(|e| e.to_string())?;
    let path = dir.join(format!("{name}.json"));
    fs::write(&path, contents).map_err(|e| e.to_string())?;
    Ok(path.display().to_string())
}

/// Pasta onde os dados ficam (mostrada na tela de configurações).
#[tauri::command]
fn data_location(app: tauri::AppHandle) -> Result<String, String> {
    data_file(&app).map(|p| p.display().to_string())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_process::init())
        .plugin(tauri_plugin_dialog::init())
        .setup(|app| {
            #[cfg(desktop)]
            app.handle().plugin(tauri_plugin_updater::Builder::new().build())?;
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![load_data, save_data, data_location, write_text_file, read_text_file, snapshot_data])
        .run(tauri::generate_context!())
        .expect("erro ao iniciar o AION2 Task Manager");
}
