package ro.ubb.android_app

import android.content.Context
import android.hardware.Sensor
import android.hardware.SensorEvent
import android.hardware.SensorEventListener
import android.hardware.SensorManager
import android.os.Bundle
import android.util.Log
import android.view.Menu
import android.view.MenuItem
import androidx.appcompat.app.AppCompatActivity
import ro.ubb.android_app.core.TAG

class MainActivity : AppCompatActivity(), SensorEventListener {
    private lateinit var sensorManager: SensorManager
    private var light: Sensor? = null


    init {
        instance = this
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)
        setSupportActionBar(findViewById(R.id.toolbar))

        sensorManager = getSystemService(Context.SENSOR_SERVICE) as SensorManager
        showAllSensors()
        checkSensor()
        light = sensorManager.getDefaultSensor(Sensor.TYPE_LIGHT)
        Log.i(TAG, "onCreate")
    }

    private fun showAllSensors() {
        val deviceSensors: List<Sensor> = sensorManager.getSensorList(Sensor.TYPE_ALL)
        Log.d(TAG, "showAllSensors");
        deviceSensors.forEach {
            Log.d(TAG, it.name + " " + it.vendor + " " + it.version);
        }
    }

    private fun checkSensor() {
        if (sensorManager.getDefaultSensor(Sensor.TYPE_GRAVITY) != null) {
            val gravSensors: List<Sensor> = sensorManager.getSensorList(Sensor.TYPE_GRAVITY)
            val sensor = gravSensors.firstOrNull { it.vendor.contains("AOSP") && it.version == 3 }
            sensor?.let { Log.d(TAG, "Check sensor " + it.name) }
        }
    }

    override fun onAccuracyChanged(sensor: Sensor, accuracy: Int) {
        Log.d(TAG, "onAccuracyChanged $accuracy");
    }

    override fun onSensorChanged(event: SensorEvent) {
        // The light sensor returns a single value.
        // Many sensors return 3 values, one for each axis.
        val lux = event.values[0]
        // Do something with this sensor value.
        Log.d(TAG, "onSensorChanged $lux");
    }

    override fun onResume() {
        super.onResume()
        light?.also {
            sensorManager.registerListener(this, it, SensorManager.SENSOR_DELAY_NORMAL)
        }
    }

    override fun onPause() {
        super.onPause()
        sensorManager.unregisterListener(this)
    }

    override fun onCreateOptionsMenu(menu: Menu): Boolean {
        menuInflater.inflate(R.menu.menu_main, menu)
        return true
    }

    override fun onOptionsItemSelected(item: MenuItem): Boolean {
        return when (item.itemId) {
            R.id.action_logout -> true
            else -> super.onOptionsItemSelected(item)
        }
    }

    companion object {
        private var instance: MainActivity? = null

        fun applicationContext() : Context {
            return instance!!.applicationContext
        }
    }
}