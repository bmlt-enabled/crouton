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
