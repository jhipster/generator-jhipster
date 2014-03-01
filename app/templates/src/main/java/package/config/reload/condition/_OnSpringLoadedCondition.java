package <%=packageName%>.config.reload.condition;

import org.springframework.boot.autoconfigure.condition.ConditionOutcome;
import org.springframework.boot.autoconfigure.condition.SpringBootCondition;
import org.springframework.context.annotation.ConditionContext;
import org.springframework.core.type.AnnotatedTypeMetadata;

/**
 * A Condition that evaluates if the JHipsterLoadtimeInstrumentation plugin has been set.
 */
public class OnSpringLoadedCondition extends SpringBootCondition {

    @Override
    public ConditionOutcome getMatchOutcome(ConditionContext context, AnnotatedTypeMetadata metadata) {

        if (System.getProperty("springloaded") != null) {
            return ConditionOutcome.match();
        }

        return ConditionOutcome.noMatch("No JHipsterLoadtimeInstrumentation plugin is set");
    }
}
