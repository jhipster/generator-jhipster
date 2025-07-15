# Spring Boot Controller Generator

Yeoman sub-generator that scaffolds Spring Boot REST controllers.

## Features
- Prompts for package name, controller name, endpoint
- Supports choosing HTTP method (GET, POST, PUT, DELETE)
- Lets you name the method (e.g., greet, createItem)
- Outputs Java controller to correct package structure

## Usage
Run inside your Spring Boot project:
```bash
yo ./generators/spring-controller
