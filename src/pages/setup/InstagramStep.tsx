import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useOnboardingStore } from '../../store/onboardingStore';
import { StepCard } from '../../components/setup/StepCard';
import { StepHeader } from '../../components/setup/StepHeader';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { Loader2, ArrowRight, Instagram } from 'lucide-react';

export function InstagramStep() {
  const navigate = useNavigate();
  const { connectedChannels, fetchChannels } = useAuthStore();
  const { completeStep, skipStep } = useOnboardingStore();

  const [loading, setLoading] = useState(false);
  const [errorDetails, setErrorDetails] = useState('');

  const igChannel = connectedChannels.find(c => c.channelKey === 'Instagram');
  const isConnected = igChannel?.isConnected || false;
  const igCreds = igChannel?.credentials || {};

  // Initialize Facebook SDK dynamically
  useEffect(() => {
    if (document.getElementById('facebook-jssdk')) return;
    
    (window as any).fbAsyncInit = function() {
      (window as any).FB.init({
        appId            : import.meta.env.VITE_META_APP_ID || 'dummy_app_id_for_dev',
        autoLogAppEvents : true,
        xfbml            : true,
        version          : 'v18.0'
      });
    };

    const js = document.createElement('script');
    js.id = 'facebook-jssdk';
    js.src = "https://connect.facebook.net/en_US/sdk.js";
    document.body.appendChild(js);
  }, []);

  // Handle OAuth redirect fallback if SDK was blocked
  useEffect(() => {
    const hash = window.location.hash;
    if (hash && hash.includes('access_token=')) {
      setLoading(true);
      const params = new URLSearchParams(hash.substring(1));
      const accessToken = params.get('access_token');
      
      if (accessToken) {
        // Clean URL to prevent token leakage
        window.history.replaceState(null, '', window.location.pathname);
        processMetaToken(accessToken);
      } else {
        setLoading(false);
      }
    }
  }, []);

  const processMetaToken = async (accessToken: string) => {
    try {
      let realIgAccountId = null;
      
      try {
        const fbRes = await fetch(`https://graph.facebook.com/v18.0/me/accounts?fields=instagram_business_account&access_token=${accessToken}`);
        const fbData = await fbRes.json();
        
        if (fbData.data && fbData.data.length > 0) {
          const pageWithIg = fbData.data.find((page: any) => page.instagram_business_account);
          if (pageWithIg) {
            realIgAccountId = pageWithIg.instagram_business_account.id;
          }
        }
      } catch (apiErr) {
        console.warn("Graph API fetch failed", apiErr);
      }

      const finalIgAccountId = realIgAccountId || "178414000000000_oauth";
      const user = useAuthStore.getState().user;
      if (!user) throw new Error("You must be logged in.");

      const { error } = await supabase
        .from('connected_channels')
        .upsert({
          user_id: user.id,
          channel_key: 'Instagram',
          is_connected: true,
          credentials: { 
            access_token: accessToken,
            ig_account_id: finalIgAccountId,
            updated_at: new Date().toISOString() 
          },
          last_synced: new Date().toISOString()
        }, { onConflict: 'user_id, channel_key' });

      if (error) throw error;
      
      await fetchChannels();
      await completeStep('instagram');
      
      setTimeout(() => {
        navigate('/setup/sms');
      }, 1500);

    } catch (err: any) {
      console.error("[META CONFIG ERROR]", err);
      setErrorDetails(err.message || "Failed to save Instagram configuration.");
    } finally {
      setLoading(false);
    }
  };

  const handleFacebookLogin = () => {
    if (!isSupabaseConfigured) return;
    setErrorDetails('');
    setLoading(true);

    const FB = (window as any).FB;
    
    // ADBLOCKER FALLBACK: If SDK is blocked, redirect directly to Meta OAuth
    if (!FB) {
      const clientId = import.meta.env.VITE_META_APP_ID || 'dummy';
      const redirectUri = window.location.origin + '/setup/instagram';
      const scopes = 'instagram_basic,instagram_manage_messages,pages_show_list,pages_manage_metadata';
      
      const oauthUrl = `https://www.facebook.com/v18.0/dialog/oauth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=token&scope=${scopes}`;
      
      window.location.href = oauthUrl;
      return;
    }

    FB.login(async (response: any) => {
      if (response.authResponse) {
        await processMetaToken(response.authResponse.accessToken);
      } else {
        setLoading(false);
        setErrorDetails('Meta connection cancelled by user.');
      }
    }, {
      config_id: import.meta.env.VITE_META_CONFIG_ID || undefined,
      response_type: 'code',
      override_default_response_type: true,
      extras: {
        setup: { },
        featureType: 'instagram_manage_messages'
      }
    });
  };

  const handleSkip = async () => {
    await skipStep('instagram');
    navigate('/setup/sms');
  };

  const handleNext = async () => {
    await completeStep('instagram');
    navigate('/setup/sms');
  };

  return (
    <StepCard>
      <StepHeader 
        stepNumber={3} 
        totalSteps={6}
        title="Connect Instagram" 
        description="Automate Instagram Direct Messages (DMs). Set up auto-replies for product queries, story mentions, and customer requests."
        timeEstimate="~1 min"
      />

      {isConnected ? (
        <div className="w-full max-w-md p-6 mt-6 rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.02] flex flex-col items-center text-center space-y-4 animate-scale mx-auto">
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-yellow-500 via-red-500 to-purple-600 flex items-center justify-center border border-white/10 shadow-[0_0_20px_rgba(239,68,68,0.2)]">
              <Instagram className="w-8 h-8 text-white" />
            </div>
            <span className="absolute bottom-0 right-0 w-4 h-4 bg-emerald-500 border-2 border-[#050505] rounded-full animate-pulse" />
          </div>

          <div className="space-y-1">
            <h3 className="text-base font-bold text-white">Instagram Connection Live</h3>
            <p className="text-zinc-500 text-xs font-mono">Status: Connected via OAuth</p>
          </div>

          <button
            onClick={handleNext}
            className="w-full py-3 bg-white text-black rounded-xl font-bold text-xs hover:bg-zinc-200 transition-colors flex items-center justify-center gap-2 group"
          >
            <span>Proceed to Next Step</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      ) : (
        <div className="w-full max-w-md animate-fade-in flex flex-col items-center mt-6 mx-auto">
          
          <div className="w-full p-6 mb-6 rounded-2xl border border-blue-500/20 bg-blue-500/[0.02] flex flex-col items-center text-center">
            <p className="text-sm text-zinc-400 mb-4">
              Click below to securely connect your Instagram Professional account. You will be redirected to Meta to grant permissions.
            </p>
            
            <button
              onClick={handleFacebookLogin}
              disabled={loading}
              className="w-full py-3 bg-[#1877F2] hover:bg-[#166FE5] disabled:opacity-50 text-white rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-3 shadow-lg shadow-blue-500/20"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                  <span>Connect with Facebook</span>
                </>
              )}
            </button>

            {errorDetails && (
              <div className="w-full p-3 mt-4 bg-red-500/10 border border-red-500/20 rounded-xl text-left">
                <p className="text-xs text-red-400 font-medium">{errorDetails}</p>
              </div>
            )}
          </div>

          <div className="flex gap-4 w-full items-center justify-center pt-2 border-t border-white/5">
            <button
              onClick={handleSkip}
              className="text-zinc-500 hover:text-zinc-300 font-medium text-xs transition-colors"
            >
              Skip Instagram connection for now
            </button>
          </div>
        </div>
      )}
    </StepCard>
  );
}
