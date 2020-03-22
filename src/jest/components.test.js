import React from 'react';
import renderer from 'react-test-renderer';

import LinkX from '../LinkX';

test('sss', () => {
    const component = renderer.create(
        <LinkX />
    )
    let tree = component.toJSON();
    expect(tree).toMatchSnapshot();
})