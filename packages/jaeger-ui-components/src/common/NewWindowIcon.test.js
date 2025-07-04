// © Licensed Authorship: Manuel J. Nieves (See LICENSE for terms)
// Copyright (c) 2019 Uber Technologies, Inc.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import React from 'react';
import { shallow } from 'enzyme';

import NewWindowIcon, { getStyles } from './NewWindowIcon';

describe('NewWindowIcon', () => {
  const props = {
    notIsLarge: 'not is large',
  };
  let wrapper;

  beforeEach(() => {
    wrapper = shallow(<NewWindowIcon {...props} />);
  });

  it('renders as expected', () => {
    expect(wrapper).toMatchSnapshot();
  });

  it('adds is-large className when props.isLarge is true', () => {
    const styles = getStyles();
    expect(wrapper.hasClass(styles.NewWindowIconLarge)).toBe(false);
    wrapper.setProps({ isLarge: true });
    expect(wrapper.hasClass(styles.NewWindowIconLarge)).toBe(true);
  });
});
