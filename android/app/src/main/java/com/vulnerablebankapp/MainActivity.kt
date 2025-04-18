package com.vulnerablebankapp

import android.os.Bundle
import android.util.Log
import android.content.Context
import android.content.SharedPreferences
import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.fabricEnabled
import com.facebook.react.defaults.DefaultReactActivityDelegate

class MainActivity : ReactActivity() {

  override fun getMainComponentName(): String = "VulnerableBankApp"

  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)

    // Log the hardcoded JWT
    Log.d("Secrets", Secrets.HARDCODED_ADMIN_JWT)

    // Store plaintext secrets in SharedPreferences
    val prefs = getSharedPreferences("VulnBankPrefs", Context.MODE_PRIVATE)
    val editor = prefs.edit()
    editor.putString("username", "admin")
    editor.putString("password", "admin123")
    editor.putString("balance", "$999999")
    editor.putString("debug_flag", "FLAG{HardcodedSecretsAreBad}")
    editor.apply()
  }

  override fun createReactActivityDelegate(): ReactActivityDelegate =
    DefaultReactActivityDelegate(this, mainComponentName, fabricEnabled)
}
