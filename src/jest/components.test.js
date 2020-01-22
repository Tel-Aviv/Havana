import React from 'react';
import renderer from 'react-test-renderer';

import MonthlyReport from '../src/Home';

test('sss', () => {
    const component = renderer.create(
        <Home />
    )
    let tree = component.toJSON();
})