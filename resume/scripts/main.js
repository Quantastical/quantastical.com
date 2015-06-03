
$(function() {
	$('.chart').easyPieChart({
		barColor : '#c27b00',
		trackColor: '#fff',
		scaleLength: 0,
		lineWidth: 7,
		size: $('.chart').width() + 14
	});

	var $moreSkillsButton = $('<button class="more" title="More Skills">&middot;&middot;&middot;</button>');
	$moreSkillsButton.click(function(){
		$moreSkillsButton.fadeOut();
		$('#more-skills').slideDown(); // TODO: Fade in & slide down simultaneously
	});
	$('#more-skills').after($moreSkillsButton);
});