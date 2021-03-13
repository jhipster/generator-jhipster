@ECHO OFF

SETLOCAL

IF EXIST "%~dp0\mvnw.cmd" (
  SET "NPM_EXE=%~dp0\target\node\npm.cmd"
  SET "INSTALL_NPM_COMMAND=%~dp0\mvnw.cmd frontend:install-node-and-npm@install-node-and-npm"
) ELSE (
  SET "NPM_EXE=%~dp0\build\node\npm.cmd"
  SET "INSTALL_NPM_COMMAND=%~dp0\gradle.bat frontend:install-node-and-npm@install-node-and-npm"
)

IF NOT EXIST "%NPM_EXE%" (
  "%INSTALL_NPM_COMMAND%"
)

"%NPM_EXE%" %*
