(function () {
  'use strict';
  /* global info, jugl */

  const template = new jugl.Template('template');
  const target = document.getElementById('examples');
  const tagsTarget = document.getElementById('tags');
  const statusTarget = document.getElementById('tag-status');
  const clearButton = document.getElementById('tag-clear');
  const searchInput = document.getElementById('keywords');

  // 汇总所有示例的标签（忽略大小写去重）并统计引用次数
  const tagIndex = {};
  const tags = [];
  info.examples.forEach(function (example) {
    (example.tags || []).forEach(function (tag) {
      const key = tag.toLowerCase();
      let entry = tagIndex[key];
      if (!entry) {
        entry = {key: key, label: tag, count: 0};
        tagIndex[key] = entry;
        tags.push(entry);
      }
      entry.count++;
    });
  });
  tags.sort(function (a, b) {
    return (
      b.count - a.count ||
      a.label.localeCompare(b.label, 'en', {sensitivity: 'base'})
    );
  });

  const selectedTags = new Set();
  const tagButtons = {};

  function toggleTag(key) {
    if (selectedTags.has(key)) {
      selectedTags.delete(key);
    } else {
      selectedTags.add(key);
    }
    updateTagButtons();
    applyFilters();
  }

  function updateTagButtons() {
    tags.forEach(function (entry) {
      tagButtons[entry.key].classList.toggle(
        'active',
        selectedTags.has(entry.key),
      );
    });
    clearButton.disabled = selectedTags.size === 0;
    if (selectedTags.size === 0) {
      statusTarget.textContent = '（全部 / All）';
    } else {
      const labels = [];
      tags.forEach(function (entry) {
        if (selectedTags.has(entry.key)) {
          labels.push(entry.label);
        }
      });
      statusTarget.textContent = `${labels.join(' + ')} · ${selectedTags.size} tag(s)`;
    }
  }

  function matchesTags(example) {
    if (selectedTags.size === 0) {
      return true;
    }
    const exampleTags = (example.tags || []).map(function (tag) {
      return tag.toLowerCase();
    });
    let matched = false;
    selectedTags.forEach(function (tag) {
      if (exampleTags.indexOf(tag) !== -1) {
        matched = true;
      }
    });
    return matched;
  }

  tags.forEach(function (entry) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'tag-filter';
    button.title = `${entry.label} (${entry.count})`;
    button.appendChild(document.createTextNode(entry.label));
    const count = document.createElement('span');
    count.className = 'tag-count';
    count.textContent = entry.count;
    button.appendChild(count);
    button.addEventListener('click', function () {
      toggleTag(entry.key);
    });
    tagButtons[entry.key] = button;
    tagsTarget.appendChild(button);
  });

  clearButton.addEventListener('click', function () {
    selectedTags.clear();
    updateTagButtons();
    applyFilters();
  });

  function listExamples(examples) {
    target.innerHTML = '';
    if (examples.length === 0) {
      const message = document.createElement('p');
      message.className = 'no-matches';
      message.textContent = '未找到匹配的示例 / No matching examples.';
      target.appendChild(message);
    } else {
      template.process({
        context: {examples: examples},
        clone: true,
        parent: target,
      });
    }
    document.getElementById('count').innerHTML = String(examples.length);
  }

  let timerId;
  function inputChange() {
    if (timerId) {
      window.clearTimeout(timerId);
    }
    const text = this.value;
    timerId = window.setTimeout(function () {
      filterList(text);
    }, 500);
  }

  function getMatchingExamples(text) {
    text = text.trim();
    if (text.length === 0) {
      return info.examples.filter(matchesTags);
    }
    const words = text.toLowerCase().split(/\W+/);
    const scores = {};
    const updateScores = function (dict, word) {
      // eslint-disable-next-line prefer-const
      for (let exIndex in dict) {
        let exScore = scores[exIndex];
        if (!exScore) {
          exScore = {};
          scores[exIndex] = exScore;
        }
        exScore[word] = (exScore[word] || 0) + dict[exIndex];
      }
    };
    words.forEach(function (word) {
      const dict = info.wordIndex[word];
      if (dict) {
        updateScores(dict, word);
      } else {
        const r = new RegExp(word);
        // eslint-disable-next-line prefer-const
        for (let idx in info.wordIndex) {
          if (r.test(idx)) {
            updateScores(info.wordIndex[idx], word);
          }
        }
      }
    });
    const examples = [];
    // eslint-disable-next-line prefer-const
    for (let exIndex in scores) {
      const ex = info.examples[exIndex];
      if (!matchesTags(ex)) {
        continue;
      }
      ex.score = 0;
      ex.words = 0;
      // eslint-disable-next-line prefer-const
      for (let word in scores[exIndex]) {
        ex.score += scores[exIndex][word];
        ex.words++;
      }
      examples.push(ex);
    }
    // sort examples, first by number of words matched, then
    // by word frequency
    examples.sort(function (a, b) {
      return b.score - a.score || b.words - a.words;
    });
    return examples;
  }

  function filterList(text) {
    const examples = getMatchingExamples(text);
    listExamples(examples);
    updateHistoryState(text);
  }

  function applyFilters() {
    filterList(searchInput.value);
  }

  function updateHistoryState(text) {
    text = text.trim();
    const params = new URLSearchParams(window.location.search);
    if (text.length === 0) {
      params.delete('q');
    } else {
      params.set('q', text);
    }
    const tagParam = Array.from(selectedTags).join(',');
    if (tagParam.length === 0) {
      params.delete('tag');
    } else {
      params.set('tag', tagParam);
    }
    let fullUrl = window.location.pathname;
    if (params.toString().length !== 0) {
      fullUrl += `?${params.toString()}`;
    }
    history.replaceState(null, '', fullUrl);
  }

  const params = new URLSearchParams(window.location.search);
  const text = params.get('q') || '';
  const tagParam = params.get('tag') || '';
  const input = searchInput;
  input.addEventListener('input', inputChange);
  input.value = text;
  tagParam.split(',').forEach(function (tag) {
    const key = tag.trim().toLowerCase();
    if (key && tagIndex[key]) {
      selectedTags.add(key);
    }
  });
  updateTagButtons();
  filterList(text);
})();
