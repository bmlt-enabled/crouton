<script id="weekdays-template" type="text/x-handlebars-template">
    <div class="tab-content">
        {{#each this.data}}
        <div id='tab{{ day }}' class='tab-pane'>
            <div id="bmlt-table-div">
                <table class='bmlt-table table table-striped table-hover table-bordered tablesaw tablesaw-stack'>
                    <tbody>
                        <?php include '_meetings.php'; ?>
                    </tbody>
                </table>
            </div>
        </div>
        {{/each}}
    </div>
</script>
<div class="bmlt-page" id="tabs-content"></div>
<script type="text/javascript">
    jQuery(function() {
        var context = {"config": croutonConfig, "data": [] };
        for (var day = 1; day <= 7; day++) {
            context['data'].push({
                "day": day,
                "meetings": getMeetings(meetingData, function(item) {
                    return item['weekday_tinyint'] === day.toString();
                })
            });
        }

        renderView("weekdays-template", "#tabs-content", context);
    });
</script>
