#!/bin/bash

#echo "Start building application"
#ng build --configuration=production
#echo "Finish building application"

echo "Clean folder before installation"
ssh -p 22 root@31.220.60.190 'cd app/DniproAlp && rm -rf * && ls -l | grep ^- | wc -l'

echo "Copying application to server"
scp -r -P 22 ../dist root@31.220.60.190:~/app/DniproAlp/
scp -r -P 22 ../pythonServer root@31.220.60.190:~/app/DniproAlp/
scp -r -P 22 ../nginx/ root@31.220.60.190:~/app/DniproAlp/
scp -P 22 ../.env root@31.220.60.190:~/app/DniproAlp/
scp -r -P 22 ../docker-compose.yml root@31.220.60.190:~/app/DniproAlp/
scp -r -P 22 ../nginx.Dockerfile root@31.220.60.190:~/app/DniproAlp/

