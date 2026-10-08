'use client';

import { useEffect, useState } from 'react';
import { AppShell } from '@/src/components/AppShell';
import { getSupabaseBrowserClient } from '@/src/lib/supabase/browser';
import { PasswordStrength } from '@/components/ui/password-strength';
import { OtpInput } from '@/components/ui/otp-input';
import { Icon } from '@/src/components/icons';

export default function Security() {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [passwordMsg, setPasswordMsg] = useState('');
  const [passwordBusy, setPasswordBusy] = useState(false);

  const [factors, setFactors] = useState<any[]>([]);
  const [qr, setQr] = useState('');
  const [secret, setSecret] = useState('');
  const [factorId, setFactorId] = useState('');
  const [mfaCode, setMfaCode] = useState('');
  const [mfaError, setMfaError] = useState('');
  const [mfaBusy, setMfaBusy] = useState(false);
  const [enrolled, setEnrolled] = useState(false);
  const [disableId, setDisableId] = useState('');

  useEffect(() => {
    void loadFactors();
  }, []);

  async function loadFactors() {
    const client = getSupabaseBrowserClient();
    const { data, error } = await client.auth.mfa.listFactors();
    if (error) {
      setMfaError(error.message);
      return;
    }

    setFactors(
      [...(data.totp ?? []), ...(data.phone ?? [])].filter(
        (factor: any) => factor.status === 'verified',
      ),
    );
  }

  async function savePassword() {
    setPasswordMsg('');

    if (password !== confirm) {
      setPasswordMsg('Passwords do not match.');
      return;
    }

    const passwordIsStrong =
      password.length >= 12 &&
      /[a-z]/.test(password) &&
      /[A-Z]/.test(password) &&
      /\d/.test(password) &&
      /[^a-zA-Z0-9]/.test(password);

    if (!passwordIsStrong) {
      setPasswordMsg('Use a strong password that meets every requirement below.');
      return;
    }

    setPasswordBusy(true);
    const client = getSupabaseBrowserClient();
    const { error } = await client.auth.updateUser({ password });
    setPasswordBusy(false);

    if (error) {
      setPasswordMsg(error.message);
      return;
    }

    setPassword('');
    setConfirm('');
    setPasswordMsg('Password saved. You can now use it to sign in.');
  }

  async function beginMfa() {
    setMfaError('');
    setQr('');
    setSecret('');
    setMfaCode('');
    setMfaBusy(true);

    const client = getSupabaseBrowserClient();
    const { data, error } = await client.auth.mfa.enroll({
      factorType: 'totp',
      friendlyName: 'CarryGo authenticator',
    });
    setMfaBusy(false);

    if (error) {
      setMfaError(error.message);
      return;
    }

    setFactorId(data.id);
    setQr(data.totp.qr_code);
    setSecret(data.totp.secret);
    setEnrolled(true);
  }

  async function verifyMfa() {
    if (mfaCode.length !== 6) {
      setMfaError('Enter the 6-digit code from your authenticator.');
      return;
    }

    setMfaBusy(true);
    const client = getSupabaseBrowserClient();
    const { data: challenge, error: challengeError } =
      await client.auth.mfa.challenge({ factorId });

    if (challengeError) {
      setMfaBusy(false);
      setMfaError(challengeError.message);
      return;
    }

    const { error } = await client.auth.mfa.verify({
      factorId,
      challengeId: challenge.id,
      code: mfaCode,
    });
    setMfaBusy(false);

    if (error) {
      setMfaError('That authenticator code is incorrect.');
      return;
    }

    setEnrolled(false);
    setQr('');
    setSecret('');
    setMfaCode('');
    await loadFactors();
  }

  async function disableMfa() {
    if (!disableId) {
      setMfaError('Select an authenticator first.');
      return;
    }

    if (mfaCode.length !== 6) {
      setMfaError('Enter the current authenticator code to disable 2FA.');
      return;
    }

    setMfaBusy(true);
    const client = getSupabaseBrowserClient();
    const { data: challenge, error: challengeError } =
      await client.auth.mfa.challenge({ factorId: disableId });

    if (challengeError) {
      setMfaBusy(false);
      setMfaError(challengeError.message);
      return;
    }

    const { error: verifyError } = await client.auth.mfa.verify({
      factorId: disableId,
      challengeId: challenge.id,
      code: mfaCode,
    });

    if (verifyError) {
      setMfaBusy(false);
      setMfaError('That authenticator code is incorrect.');
      return;
    }

    const { error } = await client.auth.mfa.unenroll({ factorId: disableId });
    setMfaBusy(false);

    if (error) {
      setMfaError(error.message);
      return;
    }

    setDisableId('');
    setMfaCode('');
    setMfaError('2FA disabled for this account.');
    await loadFactors();
  }

  return (
    <AppShell>
      <main className="shell app-page narrow">
        <div className="page-top">
          <div>
            <div className="eyebrow">SECURITY</div>
            <h1 className="app-title">
              Make your account <em>harder to break.</em>
            </h1>
            <p className="sub">
              Passwords and authenticator codes are optional. CarryGo never needs
              to store your plaintext password.
            </p>
          </div>
        </div>

        <section className="card form security-card">
          <div className="section-label">
            <span>PASSWORD</span>
            <span>OPTIONAL</span>
          </div>
          <h2>Use a password on top of email.</h2>
          <p className="sub">
            You can keep using one-time codes. A password simply gives you
            another way into the same account.
          </p>

          <label>
            New password
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="new-password"
              onFocus={() => setPasswordMsg('')}
            />
          </label>

          <PasswordStrength value={password} />

          <label>
            Confirm password
            <input
              type="password"
              value={confirm}
              onChange={(event) => setConfirm(event.target.value)}
              autoComplete="new-password"
            />
          </label>

          {passwordMsg ? (
            <div
              className={
                passwordMsg.startsWith('Password saved') ? 'success-mini' : 'error'
              }
              role="status"
            >
              {passwordMsg}
            </div>
          ) : null}

          <button
            className="btn dark"
            disabled={passwordBusy || !password || !confirm}
            onClick={() => void savePassword()}
          >
            {passwordBusy ? 'Saving…' : 'Save password →'}
          </button>
        </section>

        <section className="card form security-card">
          <div className="section-label">
            <span>TWO-FACTOR AUTHENTICATION</span>
            <span>TOTP</span>
          </div>
          <h2>Keep a second key in your pocket.</h2>
          <p className="sub">
            Use an authenticator app such as Google Authenticator, 1Password or
            Authy. Scan the QR code, then prove it works.
          </p>

          {factors.length ? (
            <div className="factor-list">
              {factors.map((factor) => (
                <div className="factor-row" key={factor.id}>
                  <div>
                    <b>{factor.friendly_name || 'Authenticator app'}</b>
                    <span>{factor.factor_type} · verified</span>
                  </div>
                  <button
                    className="btn ghost"
                    onClick={() => {
                      setDisableId(factor.id);
                      setMfaError('');
                      setMfaCode('');
                    }}
                  >
                    Disable
                  </button>
                </div>
              ))}
            </div>
          ) : null}

          {!enrolled && !disableId ? (
            <button
              className="btn dark"
              disabled={mfaBusy}
              onClick={() => void beginMfa()}
            >
              {mfaBusy ? 'Preparing…' : 'Enable 2FA →'}
            </button>
          ) : null}

          {enrolled ? (
            <div className="mfa-enroll">
              <div className="mfa-qr">
                {qr ? (
                  <img
                    src={'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(qr)}
                    alt="Scan this QR code with your authenticator app"
                  />
                ) : null}
              </div>
              <p className="hint">
                Can’t scan? Enter this secret manually: <b>{secret}</b>
              </p>
              <OtpInput
                value={mfaCode}
                onChange={setMfaCode}
                status={mfaError ? 'error' : 'idle'}
                errorMessage={mfaError}
                hint="Enter the current 6-digit code."
              />
              <div className="actions">
                <button
                  className="btn dark"
                  disabled={mfaBusy || mfaCode.length !== 6}
                  onClick={() => void verifyMfa()}
                >
                  {mfaBusy ? 'Checking…' : 'Enable 2FA'}
                </button>
                <button
                  className="btn ghost"
                  onClick={async () => {
                    const client = getSupabaseBrowserClient();
                    await client.auth.mfa.unenroll({ factorId });
                    setEnrolled(false);
                    setQr('');
                    setSecret('');
                    setMfaCode('');
                    setMfaError('');
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : null}

          {disableId ? (
            <div className="mfa-disable">
              <div className="danger-note">
                <Icon name="shield" size={15} /> You must prove access to the
                authenticator before removing it.
              </div>
              <OtpInput
                value={mfaCode}
                onChange={setMfaCode}
                status={mfaError ? 'error' : 'idle'}
                errorMessage={mfaError}
                hint="Current authenticator code"
              />
            </div>
          ) : null}

          {disableId ? (
            <div className="actions">
              <button
                className="btn dark"
                disabled={mfaBusy || mfaCode.length !== 6}
                onClick={() => void disableMfa()}
              >
                {mfaBusy ? 'Checking…' : 'Disable 2FA'}
              </button>
              <button
                className="btn ghost"
                onClick={() => {
                  setDisableId('');
                  setMfaCode('');
                  setMfaError('');
                }}
              >
                Cancel
              </button>
            </div>
          ) : null}

          {mfaError && !enrolled && !disableId ? (
            <div className="error" role="alert">
              {mfaError}
            </div>
          ) : null}
        </section>

        <div className="soft-note">
          <b>Why this setup?</b> Passwords are optional, OTP stays convenient,
          and TOTP gives you a second factor without exposing your account
          history.
        </div>
      </main>
    </AppShell>
  );
}
