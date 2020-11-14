# DniproAlp

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 8.3.3.

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `--prod` flag for a production build.


!!! ng build --prod --aot --buildOptimizer !!!


## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via [Protractor](http://www.protractortest.org/).

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI README](https://github.com/angular/angular-cli/blob/master/README.md).
"# DniproAlp" 
"# DniproAlp" 


## Deploy
    sudo ssh -p 22 root@31.220.60.190
    scp -P 22 pythonServer/* root@31.220.60.190~/app/pythonServer (root folder)
    
    clear folder:
    ssh -p 22 root@31.220.60.190 'cd ../var/www/html && rm * && ls -la'
    FE: scp -P 22 dist/dnipro-alp-pro/* root@31.220.60.190:/var/www/html
    FE: scp -P 22 dist/dnipro-alp-pro/assets root@31.220.60.190:/var/www/html/assets
    BE: scp -P 22 pythonServer/* root@31.220.60.190:~/app/pythonApp/pythonServer
    scp -P 22 docker-compose.yml root@31.220.60.190:~/app/pythonServer
    scp -P 22 .env root@31.220.60.190:~/app/pythonServer
    
    scp -r -P 22 DniproAlp root@31.220.60.190:~/app
     
    cd app/server/
    sudo service mongod restart
    npm run server_start&
    
    ps axu | grep node
    kill 26410
    
    
    



