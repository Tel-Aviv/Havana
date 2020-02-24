import React from 'react';
import renderer from 'react-test-renderer';

import Home from '../Home';

test('sss', () => {
    const component = renderer.create(
        <Home />
    )
    let tree = component.toJSON();
})