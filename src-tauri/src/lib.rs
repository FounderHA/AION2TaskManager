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

/// Pasta onde os dados ficam (mostrada na tela de configurações).
#[tauri::command]
fn data_location(app: tauri::AppHandle) -> Result<String, String> {
    data_file(&app).map(|p| p.display().to_string())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_process::init())
        .setup(|app| {
            #[cfg(desktop)]
            app.handle().plugin(tauri_plugin_updater::Builder::new().build())?;
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![load_data, save_data, data_location])
        .run(tauri::generate_context!())
        .expect("erro ao iniciar o AION2 Task Manager");
}
