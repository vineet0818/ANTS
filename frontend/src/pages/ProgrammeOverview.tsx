import { Layout } from '../components/Layout';

export default function ProgrammeOverview() {
  return (
    <Layout>
      <div style={{ marginTop: -24, marginLeft: -32, marginRight: -32 }}>
        <iframe
          src="/programme-overview.html"
          title="Programme Overview"
          style={{
            width: '100%',
            height: 'calc(100vh - 80px)',
            border: 'none',
            borderRadius: '0 0 0 0',
            display: 'block',
          }}
          allowFullScreen
        />
      </div>
    </Layout>
  );
}
