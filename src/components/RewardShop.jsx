import { useState } from 'react';
import confetti from 'canvas-confetti';
import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';
import { playRedeemSound, playErrorSound } from '../utils/sound';

export default function RewardShop({ rewards, totalTokens, onAddReward, onRedeemReward }) {
  const [newTitle, setNewTitle] = useState('');
  const [newCost, setNewCost] = useState('');

  const handleAdd = async (e) => {
    e.preventDefault();
    if (newTitle.trim() && newCost) {
      await Haptics.notification({ type: NotificationType.Success }).catch(() => {});
      onAddReward(newTitle, newCost);
      setNewTitle('');
      setNewCost('');
    }
  };

  const handleRedeem = async (cost) => {
    if (totalTokens < cost) {
      await Haptics.notification({ type: NotificationType.Error }).catch(() => {});
      playErrorSound();
      return;
    }
    if (onRedeemReward(cost)) {
      await Haptics.notification({ type: NotificationType.Success }).catch(() => {});
      playRedeemSound();
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.8 },
        colors: ['#10b981', '#f97316', '#3b82f6']
      });
    }
  };

  return (
    <div className="reward-shop">
      <h2 style={{ marginBottom: '1.5rem', color: 'var(--text-main)' }}>Reward Shop</h2>
      
      {rewards.length === 0 ? (
        <div className="empty-state">
          <span className="empty-emoji">🎁</span>
          <p>No rewards available. Create one below!</p>
        </div>
      ) : (
        <div className="rewards-grid">
          {rewards.map(reward => (
            <div 
              key={reward.id} 
              className={`reward-card ${totalTokens >= reward.cost ? 'redeemable' : ''}`}
            >
              <div className="reward-info">
                <h3>{reward.title}</h3>
                <span className="reward-cost">🪙 {reward.cost} Tokens</span>
              </div>
              <button 
                className="redeem-btn"
                disabled={totalTokens < reward.cost}
                onClick={() => handleRedeem(reward.cost)}
              >
                {totalTokens >= reward.cost ? '✨ Redeem' : '🔒 Locked'}
              </button>
            </div>
          ))}
        </div>
      )}

      <form className="reward-add-form" onSubmit={handleAdd}>
        <input 
          type="text" 
          className="reward-add-input" 
          placeholder="New reward title..."
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
        />
        <input 
          type="number" 
          className="reward-add-input reward-cost-input" 
          placeholder="Cost..."
          value={newCost}
          onChange={(e) => setNewCost(e.target.value)}
          min="1"
        />
        <button type="submit" className="reward-add-btn">Create</button>
      </form>
    </div>
  );
}
