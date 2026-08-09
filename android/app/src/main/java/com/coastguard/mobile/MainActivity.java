package com.coastguard.mobile;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;
import com.getcapacitor.Plugin;

// ⭐ IMPORTANTE: importar el plugin de cámara
import com.capacitorjs.plugins.camera.CameraPlugin;

public class MainActivity extends BridgeActivity {

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // ⭐ Registrar plugins nativos
        registerPlugin(CameraPlugin.class);
    }
}
