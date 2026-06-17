@echo off
set "ANDROID_HOME=C:\Users\91960\AppData\Local\Android\Sdk"
set "JAVA_HOME=C:\Program Files\Android\Android Studio\jbr"
cd /d "C:\DigiBoard\android"
call gradlew.bat assembleDebug
