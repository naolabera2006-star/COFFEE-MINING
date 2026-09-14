import React from 'react';
import { useApp } from '../../context/AppContext';
import { RechargeModal } from './RechargeModal';
import { WithdrawModal } from './WithdrawModal';
import { BankAccountModal } from './BankAccountModal';
import { OrderedModal } from './OrderedModal';
import { TransactionHistoryModal } from './TransactionHistoryModal';
import { CustomerSupportModal } from './CustomerSupportModal';
import { CheckInModal } from './CheckInModal';
import { GiftCodeModal } from './GiftCodeModal';
import { InvestConfirmModal } from './InvestConfirmModal';
import { GuideModal } from './GuideModal';
import { SettingsModal } from './SettingsModal';
import { RechargeApproveModal } from './RechargeApproveModal';
import { WithdrawApproveModal } from './WithdrawApproveModal';
import { UserPermissionModal } from './UserPermissionModal';
import { PlanEditorModal } from './PlanEditorModal';

export const ModalRoot: React.FC = () => {
  const { activeModal, selectedGuideSection } = useApp();

  if (!activeModal) return null;

  switch (activeModal) {
    case 'guide':
      return <GuideModal initialSection={selectedGuideSection} />;
    case 'settings':
      return <SettingsModal />;
    case 'recharge':
      return <RechargeModal />;
    case 'withdraw':
      return <WithdrawModal />;
    case 'rechargeApprove':
    case 'admin_recharge_approve':
      return <RechargeApproveModal />;
    case 'withdrawApprove':
    case 'admin_withdraw_approve':
      return <WithdrawApproveModal />;
    case 'userPermission':
    case 'admin_user_permission':
      return <UserPermissionModal />;
    case 'planEditor':
    case 'createPlan':
    case 'editPlan':
      return <PlanEditorModal />;
    case 'bank':
      return <BankAccountModal />;
    case 'ordered':
      return <OrderedModal />;
    case 'history_recharge':
      return <TransactionHistoryModal initialType="recharge" />;
    case 'history_withdraw':
      return <TransactionHistoryModal initialType="withdraw" />;
    case 'history_rejected':
      return <TransactionHistoryModal initialType="rejected" />;
    case 'history_income':
      return <TransactionHistoryModal initialType="income" />;
    case 'history':
      return <TransactionHistoryModal initialType="all" />;
    case 'support':
      return <CustomerSupportModal />;
    case 'checkIn':
      return <CheckInModal />;
    case 'giftCode':
      return <GiftCodeModal />;
    case 'investConfirm':
      return <InvestConfirmModal />;
    default:
      return null;
  }
};
