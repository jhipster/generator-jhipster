# Pre installation steps 

Change the docker Version in the following file before linking:-
> Change directory
```
cd generators/base-docker
```

open docker-utils.mjs  and change the line 

> const dockerVersion = stdout.split(' ')[2].replace(/,/g, '');

to 

> const dockerVersion = [DockerVersion]; 

for example 

> const dockerVersion = "20.10.17";

Above pre installation step is to solve the below mentioned problem:-

file:///${PATH_TO_JHIPSTER_DIR}/generator-jhipster/dist/generators/base-docker/docker-utils.mjs:45
            const dockerVersion = stdout.split(' ')[2].replace(/,/g, '');
TypeError: Cannot read properties of undefined (reading 'replace')
    at file:///${PATH_TO_JHIPSTER_DIR}/generator-jhipster/dist/generators/base-docker/docker-utils.mjs:45:55

Change the docker Version in the following file before linking:-
> Change directory
```
cd generators/base-compose
```

open generator.mjs  and change the line 

> const composeVersion = stdout.split(' ')[2].replace(/,/g, '');

to 

> const composeVersion = [ComposeVersion]; 

for example 

> const composeVersion = "1.29.2";



# Link Jhipster

Link the updated version of the jhipster to generator-jhipster
> Run cmd :-
```
npm link
```

# Example with nginx enabled

Run the example jdl file to generate the microservices.

Copy the jdl file example/jdl/reminder.jdl to the project directory.

> Run cmd:-
```
jhipster jdl reminder.jdl    
```

# Example with istio enabled

Run the example jdl file to generate the microservices.

Copy the jdl file example/jdl/reminder-istio.jdl to the project directory.

> Run cmd:-
```
jhipster jdl reminder-istio.jdl    
```

# Example with istio enabled & communication b/w microservices/gateway

Run the example jdl file to generate the microservices.

Copy the jdl file example/jdl/reminder-comm.jdl to the project directory.

> Run cmd:-
```
jhipster jdl reminder-comm.jdl    
```

# Possible solution for the errors

> ### Webpack: TypeError: Cannot read property 'properties' of undefined
> Excute below command:- 

>npm remove webpack webpack-cli

>npm install --save-dev webpack webpack-cli

>references : https://stackoverflow.com/questions/52724312/webpack-typeerror-cannot-read-property-properties-of-undefined