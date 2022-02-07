---
eleventyExcludeFromCollections: true
layout: "post.html"
title: 'Characters'
toc: true
---

<div class="clear-both"></div>

## Kidnapped and Afraid

{% for item in collections.characters %}
{% if item.data.category == 'Kidnapped and Afraid' %}
{% include 'characters-list.html' %}
{% endif %}
{% endfor %}

## Test My Fire

{% for item in collections.characters %}
{% if item.data.category == 'Test My Fire' %}
{% include 'characters-list.html' %}
{% endif %}
{% endfor %}

## Dear Diary...

{% for item in collections.characters %}
{% if item.data.category == 'Dear Diary' %}
{% include 'characters-list.html' %}
{% endif %}
{% endfor %}

## Past Nightmares. Present Ghosts. Future Fears.

{% for item in collections.characters %}
{% if item.data.category == 'Past Nightmares. Present Ghosts. Future Fears.' %}
{% include 'characters-list.html' %}
{% endif %}
{% endfor %}

## Court of Shadows and Ruin

{% for item in collections.characters %}
{% if item.data.category == 'Court of Shadows and Ruin' %}
{% include 'characters-list.html' %}
{% endif %}
{% endfor %}
