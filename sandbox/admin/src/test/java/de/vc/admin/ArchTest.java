package de.vc.admin;

import static com.tngtech.archunit.lang.syntax.ArchRuleDefinition.noClasses;

import com.tngtech.archunit.core.domain.JavaClasses;
import com.tngtech.archunit.core.importer.ClassFileImporter;
import com.tngtech.archunit.core.importer.ImportOption;
import org.junit.jupiter.api.Test;

class ArchTest {

    @Test
    void servicesAndRepositoriesShouldNotDependOnWebLayer() {
        JavaClasses importedClasses = new ClassFileImporter()
            .withImportOption(ImportOption.Predefined.DO_NOT_INCLUDE_TESTS)
            .importPackages("de.vc.admin");

        noClasses()
            .that()
            .resideInAnyPackage("de.vc.admin.service..")
            .or()
            .resideInAnyPackage("de.vc.admin.repository..")
            .should()
            .dependOnClassesThat()
            .resideInAnyPackage("..de.vc.admin.web..")
            .because("Services and repositories should not depend on web layer")
            .check(importedClasses);
    }
}
