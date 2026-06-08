@echo off
echo Adding firewall rule for FlexAI Backend (port 3000)...
netsh advfirewall firewall add rule name="FlexAI Backend Port 3000" dir=in action=allow protocol=TCP localport=3000
echo Done! You can close this window.
pause
