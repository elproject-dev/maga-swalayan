import React from 'react';
import { BetaAnalyticsDataClient } from '@google-analytics/data';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UsersIcon, EyeIcon, ClockIcon, UserCheck, Users, UserCog } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { UsersPieChart } from '@/components/analytics/users-pie-chart';
import { CityTable } from '@/components/analytics/city-table';
import { SourceBarChart } from '@/components/analytics/source-bar-chart';
import { TrafficLineChart } from '@/components/analytics/traffic-line-chart';

export const revalidate = 3600; // Cache data for 1 hour

async function getAnalyticsData() {
  const propertyId = process.env.GA_PROPERTY_ID;
  if (!propertyId || propertyId === 'isi_dengan_property_id_google_analytics_anda') {
    return { error: 'GA_PROPERTY_ID belum dikonfigurasi. Pastikan untuk menambahkannya di Environment Variables Vercel.' };
  }

  try {
    // Check if we have direct credentials (for Vercel) or fallback to Application Default Credentials (local JSON file)
    let clientOptions = {};
    if (process.env.GOOGLE_CLIENT_EMAIL && process.env.GOOGLE_PRIVATE_KEY) {
      clientOptions = {
        credentials: {
          client_email: process.env.GOOGLE_CLIENT_EMAIL,
          // Replace escaped newlines from Vercel env vars
          private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        }
      };
    }

    const analyticsDataClient = new BetaAnalyticsDataClient(clientOptions);
    const [response] = await analyticsDataClient.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [
        {
          startDate: '30daysAgo',
          endDate: 'today',
        },
      ],
      metrics: [
        { name: 'activeUsers' },
        { name: 'screenPageViews' },
        { name: 'sessions' }
      ],
    });

    // City Report
    const [cityResponse] = await analyticsDataClient.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [
        { startDate: '30daysAgo', endDate: 'today' },
      ],
      dimensions: [
        { name: 'city' }
      ],
      metrics: [
        { name: 'activeUsers' }
      ],
      orderBys: [
        {
          metric: { metricName: 'activeUsers' },
          desc: true,
        }
      ],
      limit: 10,
    });

    const cityData = cityResponse.rows?.map(row => ({
      city: row.dimensionValues?.[0]?.value || 'Unknown',
      activeUsers: parseInt(row.metricValues?.[0]?.value || '0', 10)
    })) || [];

    // Source Report
    const [sourceResponse] = await analyticsDataClient.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [
        { startDate: '30daysAgo', endDate: 'today' },
      ],
      dimensions: [
        { name: 'firstUserSourceMedium' }
      ],
      metrics: [
        { name: 'activeUsers' }
      ],
      orderBys: [
        {
          metric: { metricName: 'activeUsers' },
          desc: true,
        }
      ],
      limit: 10,
    });

    const sourceData = sourceResponse.rows?.map(row => ({
      source: row.dimensionValues?.[0]?.value || 'Unknown',
      activeUsers: parseInt(row.metricValues?.[0]?.value || '0', 10)
    })) || [];

    // Trend Report
    const [trendResponse] = await analyticsDataClient.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [
        { startDate: '30daysAgo', endDate: 'today' },
      ],
      dimensions: [
        { name: 'date' }
      ],
      metrics: [
        { name: 'activeUsers' },
        { name: 'screenPageViews' }
      ],
      orderBys: [
        {
          dimension: { dimensionName: 'date' },
        }
      ],
    });

    const trendData = trendResponse.rows?.map(row => {
      const rawDate = row.dimensionValues?.[0]?.value || '';
      let formattedDate = rawDate;
      if (rawDate.length === 8) {
        const month = rawDate.substring(4, 6);
        const day = rawDate.substring(6, 8);
        formattedDate = `${day}/${month}`;
      }
      return {
        date: formattedDate,
        activeUsers: parseInt(row.metricValues?.[0]?.value || '0', 10),
        pageViews: parseInt(row.metricValues?.[1]?.value || '0', 10)
      };
    }) || [];

    if (response.rows && response.rows.length > 0) {
      const row = response.rows[0];
      return {
        overview: {
          activeUsers: row.metricValues?.[0]?.value || '0',
          pageViews: row.metricValues?.[1]?.value || '0',
          sessions: row.metricValues?.[2]?.value || '0',
        },
        cityData,
        sourceData,
        trendData
      };
    }
    
    return {
      overview: {
        activeUsers: '0',
        pageViews: '0',
        sessions: '0',
      },
      cityData,
      sourceData,
      trendData
    };
  } catch (error: any) {
    console.error('Error fetching GA data:', error);
    return { error: error.message || 'Gagal mengambil data dari Google Analytics. Pastikan Property ID benar dan Service Account JSON memiliki akses minimal Viewer.' };
  }
}

export default async function AnalyticsPage() {
  const data = await getAnalyticsData();
  
  // Fetch DB metrics
  const { count: totalPelanggan } = await supabase.from('pelanggan').select('*', { count: 'exact', head: true });
  const { count: totalMember } = await supabase.from('pelanggan').select('*', { count: 'exact', head: true }).not('membercard', 'is', null);
  const { count: totalStaf } = await supabase.from('staf').select('*', { count: 'exact', head: true });

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Google Analytics</h2>
      </div>
      
      {data.error ? (
        <div className="rounded-md bg-destructive/15 p-4 border border-destructive/20">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-destructive">Konfigurasi Dibutuhkan</h3>
              <div className="mt-2 text-sm text-destructive/90">
                <p>{data.error}</p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Pelanggan
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalPelanggan || 0}</div>
              <p className="text-xs text-muted-foreground">
                Terdaftar di database
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Member
              </CardTitle>
              <UserCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalMember || 0}</div>
              <p className="text-xs text-muted-foreground">
                Memiliki kartu member
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Staf
              </CardTitle>
              <UserCog className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalStaf || 0}</div>
              <p className="text-xs text-muted-foreground">
                Staf / Admin aktif
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Pengguna Aktif (30 Hari)
              </CardTitle>
              <UsersIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.overview?.activeUsers || '0'}</div>
              <p className="text-xs text-muted-foreground">
                Total pengguna aktif bulan ini
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Tayangan Halaman
              </CardTitle>
              <EyeIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.overview?.pageViews || '0'}</div>
              <p className="text-xs text-muted-foreground">
                Total halaman yang dilihat
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Sesi
              </CardTitle>
              <ClockIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.overview?.sessions || '0'}</div>
              <p className="text-xs text-muted-foreground">
                Total sesi kunjungan
              </p>
            </CardContent>
          </Card>
        </div>
      )}
      
      {/* Chart Section */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mt-4 items-stretch">
        <UsersPieChart 
          totalPelanggan={totalPelanggan || 0}
          totalMember={totalMember || 0}
          totalStaf={totalStaf || 0}
        />
        {!data.error && (
          <>
            <CityTable data={data.cityData || []} />
            <SourceBarChart data={data.sourceData || []} />
          </>
        )}
      </div>

      {!data.error && (
        <div className="mt-4">
          <TrafficLineChart data={data.trendData || []} />
        </div>
      )}
    </div>
  );
}
