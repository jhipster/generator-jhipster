package de.vc.admin.cucumber;

import de.vc.admin.AdminApp;
import io.cucumber.spring.CucumberContextConfiguration;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.web.WebAppConfiguration;

@CucumberContextConfiguration
@SpringBootTest(classes = AdminApp.class)
@WebAppConfiguration
public class CucumberTestContextConfiguration {}
