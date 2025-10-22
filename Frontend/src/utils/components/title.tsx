import React from 'react';

import { APP_NAME } from '../../config';

function Title({
	title,
	description,
}: {
	title: string;
	description?: string;
}) {
	React.useEffect(() => {
		document.title = title + ` - ${description} - ${APP_NAME}`;
	}, [title, description]);

	return null;
}

export default Title;
