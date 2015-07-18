<%
function buildEntityFieldValidators(field) {
	if (field.fieldValidate == true) {
		var fieldValidateRules = fields.fieldValidateRules;
		var validators = [];

	    if (fieldValidateRules.indexOf('required') != -1) {
	        validators.push('required');
	    }
	    if (fieldValidateRules.indexOf('minlength') != -1) {
	        validators.push('ng-minlength="' + field.fieldValidateRulesMinlength + '"');
	    }
	    if (fieldValidateRules.indexOf('maxlength') != -1) {
	        validators.push('ng-maxlength="' + field.fieldValidateRulesMaxlength + '"');
	    }
	    if (fieldValidateRules.indexOf('min') != -1) {
	        validators.push('min="' + field.fieldValidateRulesMin + '"');
	    }
	    if (fieldValidateRules.indexOf('max') != -1) {
	        validators.push('max="' + field.fieldValidateRulesMax + '"');
	    }
	    if (fieldValidateRules.indexOf('minbytes') != -1) {
	        validators.push('minbytes="' + field.fieldValidateRulesMinbytes +'"');
	    }
	    if (fieldValidateRules.indexOf('maxbytes') != -1) {
	        validators.push('maxbytes="' + field.fieldValidateRulesMaxbytes +'"');
	    }
	    if (fieldValidateRules.indexOf('pattern') != -1) {
	        validators.push('ng-pattern="/' + field.fieldValidateRulesPattern + '/"');
	    }

	    return validators.join(' ');
	}
	return '';
}
%>

<%= buildEntityFieldValidators(fields[fieldId]) %>
