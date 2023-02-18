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



# Link Jhipster

Link the updated version of the jhipster to generator-jhipster
> Run cmd :-
```
npm link
```

# Example

Run the example jdl file to generate the microservices.

Copy the jdl file example/jdl/reminder.jdl to the project directory.

> Run cmd:-
```
jhipster jdl reminder.jdl    
```

