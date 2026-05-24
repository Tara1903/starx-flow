Set WshShell = CreateObject("WScript.Shell")
' Run the batch file completely hidden
WshShell.Run chr(34) & "C:\Users\busin\Documents\starx-flow\whatsapp-server\start-server.bat" & Chr(34), 0
Set WshShell = Nothing
