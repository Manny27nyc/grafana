// © Licensed Authorship: Manuel J. Nieves (See LICENSE for terms)
// Copyright (c) 2017 Uber Technologies, Inc.
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

export function localeStringComparator(itemA, itemB) {
  return itemA.localeCompare(itemB);
}

export function numberSortComparator(itemA, itemB) {
  return itemA - itemB;
}

export function classNameForSortDir(dir) {
  return `sorted ${dir === 1 ? 'ascending' : 'descending'}`;
}

export function getNewSortForClick(prevSort, column) {
  const { defaultDir = 1 } = column;

  return {
    key: column.name,
    dir: prevSort.key === column.name ? -1 * prevSort.dir : defaultDir,
  };
}

export function createSortClickHandler(column, currentSortKey, currentSortDir, updateSort) {
  return function onClickSortingElement() {
    const { key, dir } = getNewSortForClick({ key: currentSortKey, dir: currentSortDir }, column);
    updateSort(key, dir);
  };
}
