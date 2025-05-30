# Installation Options

Catena is **source available**, which means you need to either run it on your machine or deploy it to a live environment that you control.

## Running Catena Locally

The only supported method for installing Catena locally is by building it from source. You may either do this by compiling Catena directly on your machine or by using Docker.

{% cards columns=2 %}
{% card title="Source (Recommended)" to="./source.md" %}
Run Catena From Source on Your Machine
{% /card %}

{% card title="Docker" to="./docker.md" %}
Run Catena With Docker on Your Machine
{% /card %}
{% /cards %}

## Deploying Catena to a Live Environment

Alternatively, you can deploy Catena to live environment such as Heroku or AWS.

{% cards columns=2 %}
{% card title="Heroku" to="./heroku.md" %}
Use this method if you prefer the quickest and easiest deployment.
{% /card %}

{% card title="AWS (Single Node)" to="./aws-ec2.md" %}
Use this method if you prefer to run your infrastructure on AWS.
{% /card %}
{% /cards %}

When you're ready, check out our [CI/CD](/ci_cd/index.md) information on automated tested and integrating Catena into your CI/CD pipeline.