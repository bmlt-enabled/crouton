<script id="header-template" type="text/x-handlebars-template">
{{#ifEquals this.config.header "1"}}
        {{#ifEquals this.config.include_weekday_button "1"}}
        <div class="bmlt-button-container"><a id="day" class="btn btn-primary btn-sm">{{this.words.weekday}}</a></div>
        {{/ifEquals}}
        {{#ifEquals this.config.include_city_button "1"}}
        <div class="bmlt-button-container"><a id="city" class="btn btn-primary btn-sm">{{this.words.city}}</a></div>
        {{/ifEquals}}

        {{#ifEquals this.config.has_cities "1"}}
        <div class="bmlt-dropdown-container">
            <select style="width:{{this.config.dropdown_width}};" data-placeholder="{{this.words.cities}}" data-pointer="Cities" id="e2">
                <option></option>
                {{#each this.uniqueData.cities}}
                <option value="a-{{formatDataPointer this}}">{{this}}</option>
                {{/each}}
            </select>
        </div>
        {{/ifEquals}}

        {{#ifEquals this.config.has_groups "1"}}
        <div class="bmlt-dropdown-container">
            <select style="width:{{this.config.dropdown_width}};" data-placeholder="{{this.words.groups}}" data-pointer="Groups" id="e3">
                <option></option>
                {{#each this.uniqueData.groups}}
                    <option value="a-{{formatDataPointer this}}">{{this}}</option>
                {{/each}}
            </select>
        </div>
        {{/ifEquals}}

        {{#ifEquals this.config.has_areas "1"}}
        <div class="bmlt-dropdown-container">
            <select style="width:{{this.config.dropdown_width}};" data-placeholder="{{this.words.areas}}" data-pointer="Areas" id="e8">
                <option></option>
                {{#each this.uniqueData.areas}}
                <option value="a-{{@key}}">{{this}}</option>
                {{/each}}
            </select>
        </div>
        {{/ifEquals}}

        {{#ifEquals this.config.has_locations "1"}}
        <div class="bmlt-dropdown-container">
            <select style="width:{{this.config.dropdown_width}};" data-placeholder="{{this.words.locations}}" data-pointer="Locations" id="e4">
                <option></option>
                {{#each this.uniqueData.locations}}
                <option value="a-{{formatDataPointer this}}">{{this}}</option>
                {{/each}}
            </select>
        </div>
        {{/ifEquals}}

        {{#ifEquals this.config.has_sub_province "1"}}
        <div class="bmlt-dropdown-container">
            <select style="width:{{this.config.dropdown_width}};" data-placeholder="{{this.words.counties}}" data-pointer="Counties" id="e7">
                <option></option>
                {{#each this.uniqueData.sub_provinces}}
                <option value="a-{{formatDataPointer this}}">{{this}}</option>
                {{/each}}
            </select>
        </div>
        {{/ifEquals}}

        {{#ifEquals this.config.has_states "1"}}
        <div class="bmlt-dropdown-container">
            <select style="width:{{this.config.dropdown_width}};" data-placeholder="{{this.words.states}}" data-pointer="States" id="e9">
                <option></option>
                {{#each this.uniqueData.states}}
                <option value="a-{{formatDataPointer this}}">{{this}}</option>
                {{/each}}
            </select>
        </div>
        {{/ifEquals}}

        {{#ifEquals this.config.has_zip_codes "1"}}
        <div class="bmlt-dropdown-container">
            <select style="width:{{this.config.dropdown_width}};" data-placeholder="{{this.words.postal_codes}}" data-pointer="Zips" id="e5">
                <option></option>
                {{#each this.uniqueData.zips}}
                <option value="a-{{formatDataPointer this}}">{{this}}</option>
                {{/each}}
            </select>
        </div>
        {{/ifEquals}}

        {{#ifEquals this.config.has_formats "1"}}
        <div class="bmlt-dropdown-container">
            <select style="width:{{this.config.dropdown_width}};" data-placeholder="{{this.words.formats}}" data-pointer="Formats" id="e6">
                <option></option>
                {{#each this.uniqueData.formats}}
                <option value="a-{{formatDataPointer this}}">{{this}}</option>
                {{/each}}
            </select>
        </div>
        {{/ifEquals}}
    </div>
{{/ifEquals}}
{{#ifEquals this.config.has_tabs "1"}}
    {{#ifEquals this.config.has_meetings "1"}}
        {{#ifEquals this.config.view_by "weekdays"}}
            <div class="bmlt-page show" id="nav-days">
        {{else}}
            <div class="bmlt-page hide" id="nav-days">
        {{/ifEquals}}
            <ul class="nav nav-tabs">
                {{#times 7}}
                    <li><a href="#tab{{this}}" data-toggle="tab">{{getDayOfTheWeek this}}</a></li>
                {{/times}}
            </ul>
        </div>
    {{/ifEquals}}
{{/ifEquals}}
</script>
<div class="hide bmlt-header" id="bmlt-header"></div>
<script type="text/javascript">
    jQuery(function($) {
        renderView("header-template", "#bmlt-header", {
            "config": croutonConfig,
            "uniqueData": uniqueData,
            "words": words
        });
    });
</script>
