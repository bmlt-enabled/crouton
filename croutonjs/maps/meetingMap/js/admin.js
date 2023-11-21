var $ml = jQuery.noConflict
jQuery(document).ready(function($ml) {
    showOrHide($ml("#tile_provider").val());
    $ml("#tile_provider").change(function() {
        showOrHide($ml("#tile_provider").val());
    })
    function showOrHide(val) {
    if (val == 'google') {
        $ml("#nominatim_div").hide();
        $ml("#custom_tile_provider").hide();
        $ml("#api_key_div").show();
    } else if (val == 'custom') {
        $ml("#nominatim_div").show();
        $ml("#custom_tile_provider").show();
        $ml("#api_key_div").hide();
    } else {
        $ml("#nominatim_div").show();
        $ml("#custom_tile_provider").hide();
        $ml("#api_key_div").hide();   
    }
}
});