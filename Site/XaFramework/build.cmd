@echo off

setlocal

set PATH="..\..\tools\node\"

call ..\tools\node\npm.cmd install

::pushd "%~1"

::@echo Current directoy: %cd%

..\tools\node\node.exe ..\node_modules\grunt-cli\bin\grunt %~2 --target="%~1"

::popd

endlocal