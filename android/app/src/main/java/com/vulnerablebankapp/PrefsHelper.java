package com.vulnerablebankapp;

import android.content.Context;
import android.content.SharedPreferences;

public class PrefsHelper {

    private static final String PREFS_NAME = "VulnBankPrefs";

    public static void storeSecrets(Context context) {
        SharedPreferences prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
        SharedPreferences.Editor editor = prefs.edit();

        editor.putString("username", "admin");
        editor.putString("password", "admin123");
        editor.putString("balance", "$999999");
        editor.putString("debug_flag", "FLAG{HardcodedSecretsAreBad}");

        editor.apply();
    }
}
