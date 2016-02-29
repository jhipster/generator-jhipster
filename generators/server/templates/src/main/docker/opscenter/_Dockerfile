FROM python:2.7

RUN mkdir /opt/opscenter && wget -O - http://downloads.datastax.com/community/opscenter-5.2.2.tar.gz | tar xzf - --strip-components=1 -C /opt/opscenter

WORKDIR /opt/opscenter

CMD bin/opscenter -f
