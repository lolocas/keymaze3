@echo off

setlocal

if exist "%PROGRAMFILES(X86)%" (goto 64BITS) else (goto 32BITS)

:32BITS
echo Mode 32 bits
set NODEEXE=".\tools\node_x86\node.exe"
goto BEGIN

:64BITS
echo Mode 64 bits
set NODEEXE=".\tools\node\node.exe"
goto BEGIN

:BEGIN
if not exist ".\tools\node_x86\node_modules" ( mklink /D ".\tools\node_x86\node_modules" "..\node\node_modules" )
if not exist "%~dp0node_modules\grunt\lib\grunt.js" (
	call "%~dp0install-tools.cmd"
)

::pushd "%~1"

::@echo Current directoy: %cd%

if "%~1"=="XaFramework" (
	goto grunt
)

if "%~1"=="XaCommon" (
	goto grunt
)

:grunt
set application=%~3
if "%~1" == "XaCommon" set application=%~3
if "%~1" == "XaFramework"  set application=%~3
if "%application%" == "" set application=%~1


:RUN_GRUNT

echo PRODUIT %APPLICATION% EXCLUSION DES REPERTOIRES DANS XACOMMON %excludeList%
%NODEEXE% .\node_modules\grunt-cli\bin\grunt %~2 --target="%~1"  --excludeFolderCommonList="%excludeList%" --excludeFolderCountryList="%excludeFolderCountryList%"

::popd

endlocal