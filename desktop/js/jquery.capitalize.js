String.prototype.capitalize = function(type) {

	// if type = all, capitalize first letter of each word
	if(type === 'all'){
		array		= this.split(' '); // split on spaces
		capitalized	= '';

		$.each(array, function( index, value ) {
			capitalized += value.charAt(0).toUpperCase() + value.slice(1);

			if( array.length != (index+1) )
				capitalized += ' '; // add a space if not end of array
		});
		return capitalized;
	}

	// if type = title, capitalize first letter of each word so long as it is not
	// an article, coordinate conjunction, preposition (etc) unless it is the first word
	// -> traditionally left uppercase if over 4 or 5 letters
	// -> I'm only doing the common ones, add more in the doNotCapitalize array
	if(type === 'title'){
		array		= this.split(' '); // split on spaces
		capitalized	= '';
		doNotCapitalize	= ["a", "an", "and", "as", "at", "but", "by", "etc", "for", "in", "into", "is", "nor", "of", "off", "on", "onto", "or", "so", "the", "to", "unto", "via"];

		$.each(array, function( index, value ) {
			// only capitalize if first word or not in doNotCapitalize array
			if( index === 0 || $.inArray(value, doNotCapitalize) === -1 ) // inArray returns -1 for false, 0 for element index in array
				capitalized += value.charAt(0).toUpperCase() + value.slice(1);
			else
				capitalized += value;

			if( array.length != (index+1) )
				capitalized += ' '; // add a space if not end of array
		});
		return capitalized;
	}
	
	// else just capitalize first letter of first word
	return this.charAt(0).toUpperCase() + this.slice(1);
};

// Usage:
test = "and this is a test string.";
test.capitalize();		// result: And this is a test string.
test.capitalize('title');	// result: And This is a Test String.
test.capitalize('all');		// result: And This Is A Test String.