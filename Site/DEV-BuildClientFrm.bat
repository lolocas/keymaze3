echo on
set fullPathInitial=%~dp0
set fullPath=%~dp0
%fullPath:~0,1%:
cd %fullPath%

call .\build.cmd XaFramework dev

%fullPathInitial:~0,1%:
cd %fullPathInitial%

call .\build.cmd View dev2

cd %fullPathInitial%
pause
