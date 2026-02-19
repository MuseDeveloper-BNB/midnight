import type { Metadata } from 'next';
import ChartWithData from '@/components/chart/ChartWithData';

export const metadata: Metadata = {
  title: 'Butter Index – Midnight News',
  description: '$NIGHT per pound of US Butter. Dynamic chart updated daily.',
};

export default function ButterIndexPage() {
  return (
    <section className="chart-page">
      <header className="list-header">
        <h1>Butter Index</h1>
      </header>

      <div className="chart-intro">
        <p>
          The Butter Index shows how many <strong>$NIGHT</strong> tokens are needed to buy one pound of US butter (Grade AA).
          It combines the weekly US butter price from{' '}
          <a href="https://www.clal.it/en/?section=burro_usa" target="_blank" rel="noopener noreferrer">
            CLAL.it
          </a>{' '}
          multiplied by 2.5× for retail price with the daily <strong>$NIGHT</strong> price from CoinMarketCap. The chart updates as new data becomes available.
        </p>
      </div>

      <ChartWithData showLatest={false} showChart={true} />
    </section>
  );
}
