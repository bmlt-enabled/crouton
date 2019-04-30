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
