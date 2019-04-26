<script id="header-template" type="text/x-handlebars-template">
{{#ifEquals this.config.header "1"}}
    <div class="bmlt-dropdown-container">
        <select style="width:auto;" data-placeholder="Groups" data-pointer="Groups" id="e3">
        <option></option>
        {{#each this.uniqueData.cities}}
            <option value=a-{{formatDataPointer this}}">{{this}}</option>
        {{/each}}
        </select>
    </div>
{{/ifEquals}}
</script>
<div class="hide bmlt-header" id="bmlt-header"></div>
<script type="text/javascript">
    jQuery(function() {
        renderView("header-template", "#bmlt-header", {
            "config": croutonConfig,
            "uniqueData": uniqueData
        });
    });
</script>
