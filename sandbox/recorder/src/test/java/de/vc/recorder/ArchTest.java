package de.vc.recorder;

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
            .importPackages("de.vc.recorder");

        noClasses()
            .that()
            .resideInAnyPackage("de.vc.recorder.service..")
            .or()
            .resideInAnyPackage("de.vc.recorder.repository..")
            .should()
            .dependOnClassesThat()
            .resideInAnyPackage("..de.vc.recorder.web..")
            .because("Services and repositories should not depend on web layer")
            .check(importedClasses);
    }
}
