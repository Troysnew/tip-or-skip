import React, { useState } from 'react';
import { Linking, View } from 'react-native';
import { Text } from '../components/Text';
import { Body, Btn, Card, H2, H3, ProTag } from '../components/ui';
import { PRO_PRICE, TEST_MODE } from '../pro/purchases';
import { HANDLE_APPS, hasHandles } from '../lib/pay';
import { useStore } from '../store';
import { HandlesSheet } from './SettleUp';
import { useColors } from '../theme';

function Link({ url, children }: { url: string; children: string }) {
  const c = useColors();
  return (
    <Text accessibilityRole="link" onPress={() => Linking.openURL(url)} style={{ color: c.accent, fontSize: 13, fontWeight: '600', textDecorationLine: 'underline' }}>
      {children}
    </Text>
  );
}

export function DataScreen() {
  const c = useColors();
  const { pro, setPro, requests, openPaywall, flash, payHandles, requestApps } = useStore();
  const [editingHandles, setEditingHandles] = useState(false);
  const prefix = { venmo: '@', cashtag: '$', paypal: 'paypal.me/' } as const;
  return (
    <View style={{ gap: 12 }}>
      <Card>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <H3>Tip or Skip Pro</H3>
          <ProTag />
        </View>
        {pro ? (
          <>
            <Body>Pro is unlocked on this phone.</Body>
            {TEST_MODE && (
              <>
                <Body muted small>Test mode: purchases aren't connected yet. Turn Pro off to see what free users see.</Body>
                <Btn small ghost title="Turn off Pro (testing)" onPress={() => { setPro(false); flash('Pro turned off'); }} />
              </>
            )}
          </>
        ) : (
          <>
            <Body>Tip history, saved presets, split by item, and the holiday planner. One payment of {PRO_PRICE}.</Body>
            <Btn small title="See Pro" onPress={() => openPaywall('')} />
          </>
        )}
      </Card>
      <Card>
        <H3>How friends pay you</H3>
        {hasHandles(payHandles) ? (
          HANDLE_APPS.filter((a) => payHandles[a.key]).map((a) => (
            <Body key={a.key}>
              {a.name}: {prefix[a.key]}{payHandles[a.key]}{requestApps[a.key] === false ? ' (off in requests)' : ''}
            </Body>
          ))
        ) : (
          <Body muted small>Add your Venmo, Cash App or PayPal.Me names. Payment requests include them as pay links with the amount filled in. Saved on this phone only.</Body>
        )}
        <Btn small ghost title={hasHandles(payHandles) ? 'Edit' : 'Add'} onPress={() => setEditingHandles(true)} />
      </Card>
      <HandlesSheet visible={editingHandles} onClose={() => setEditingHandles(false)} />
      <Text style={{ color: c.muted, fontSize: 12 }}>Version 0.7.8</Text>
      <View style={{ gap: 4 }}>
        <H2>Where the numbers come from</H2>
        <Body muted>Stats appear only where a published survey measured that service. Everything else waits for in-app responses.</Body>
      </View>
      <Card>
        <H3>Pew Research Center, Tipping Culture in America</H3>
        <Body>11,945 U.S. adults, surveyed Aug 7 to 27, 2023, published Nov 9, 2023. Gives the full always/often/sometimes/rarely/never split for 7 services, plus the tip amount people leave for an average sit-down meal.</Body>
        <View style={{ flexDirection: 'row', gap: 16 }}>
          <Link url="https://www.pewresearch.org/2023/11/09/services-americans-do-and-dont-tip-for-and-how-much/">Report</Link>
          <Link url="https://www.pewresearch.org/wp-content/uploads/2023/11/SR_23.11.09_tipping-culture_topline.pdf">Topline PDF</Link>
        </View>
      </Card>
      <Card>
        <H3>Bankrate annual tipping survey, 2025</H3>
        <Body>2,445 U.S. adults, surveyed April 23 to 25, 2025. Reports the share who always tip for 6 services used here.</Body>
        <Link url="https://www.fox5atlanta.com/news/heres-who-most-least-likely-get-tips-2025">Coverage on FOX 5</Link>
      </Card>
      <Card>
        <H3>Etiquette guidance</H3>
        <Body>60 of 61 services cite a published guide or article, linked on each service. Tipping stadium vendors is based on common practice. The holiday planner follows the Emily Post Institute's holiday guide.</Body>
        <View style={{ flexDirection: 'row', gap: 16 }}>
          <Link url="https://emilypost.com/advice/general-tipping-guide">Tipping guide</Link>
          <Link url="https://emilypost.com/advice/holiday-tipping-guide">Holiday guide</Link>
        </View>
      </Card>
      <Card>
        <H3>In-app responses</H3>
        <Body>Answers to "What did you tip?" are saved on this phone for now. Once there is a backend, they feed a shared distribution that appears when a service reaches 50 responses.</Body>
      </Card>
      <Card>
        <H3>Services people asked for</H3>
        {requests.length ? requests.map((r) => <Body key={r}>• {r}</Body>) : <Body muted small>None yet. Search the Services tab for something missing and tap Request.</Body>}
      </Card>
    </View>
  );
}
