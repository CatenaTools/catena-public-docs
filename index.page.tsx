import React from 'react';
import styled from 'styled-components';

import { Button } from '@redocly/theme';

export default function HomePage() {
  return (
    <div>
      <HeroContainer>
        <h1>Catena Tools API</h1>
        <p>Built by game developers, for game developers, to simplify your game's back end workflow.</p>
        <Button size="large" variant="primary" tone="brand" to="/guides/key-concepts">
          Get started
        </Button>
      </HeroContainer>
    </div>
  );
}

const HeroContainer = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 32px;
  position: relative;
  .code-line::before {
    color: var(--text-color-disabled);
  }

  span {
    color: var(--text-color-secondary);
  }

  h1 {
    text-align: center;
    font-size: 92px;
    font-weight: 700;
    line-height: 102px;
    letter-spacing: 1px;
    margin-bottom: 24px;
    margin: 160px 0 24px 0;
  }

  > p {
    color: var(--text-color-primary);
    text-align: center;
    font-size: 20px;
    line-height: 28px;
    margin: 0 0 24px 0;
  }
`;