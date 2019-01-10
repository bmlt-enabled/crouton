<script id="byday-template" type="text/x-handlebars-template">
    <div id="bmlt-table-div">
        <table class='bmlt-table table table-striped table-hover table-bordered tablesaw tablesaw-stack'>
            {{#each this}}
                <tbody class="bmlt-data-rows h-{{this.day}}">
                    <tr class="meeting-header">
                        <td colspan="3">{{this.day}}</td>
                    </tr>
                    <?php include '_meetings.php'; ?>
                </tbody>
            {{/each}}
        </table>
    </div>
</script>
<div class="bmlt-page hide" id="byday"></div>
<script type="text/javascript">
    jQuery(function() {
        var context = [];
        for (var day = 1; day <= 7; day++) {
            context.push({
                "day": getDay(day),
                "meetings": getMeetings(meetingData, function(item) {
                    return item['weekday_tinyint'] === day.toString();
                })
            });
        }

        renderView("byday-template", "#byday", context);
    });
</script>
