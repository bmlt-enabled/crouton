<script id="cities-template" type="text/x-handlebars-template">
    <div id="bmlt-table-div">
        <table class='bmlt-table table table-striped table-hover table-bordered tablesaw tablesaw-stack'>
            <tbody>
            {{#each this}}
                <tr class="meeting-header">
                    <td colspan="3">{{city}}</td>
                </tr>
                <?php include '_meetings.php'; ?>
            {{/each}}
            </tbody>
        </table>
    </div>
</script>
<div class="bmlt-page hide" id="cities"></div>
<script type="text/javascript">
    jQuery(function() {
        var cities = getUniqueValuesOfKey(meetingData, 'location_municipality').sort();
        var context = [];
        for (var i = 0; i < cities.length; i++) {
            context.push({
                "city": cities[i],
                "meetings": getMeetings(meetingData, function(item) {
                    return item['location_municipality'] === cities[i];
                })
            });
        }

        renderView("cities-template", "#cities", context);
    });
</script>
