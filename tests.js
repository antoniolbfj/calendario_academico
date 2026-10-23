/**
 * Verbose test harness for v0.0.5-beta18-pv29.
 * Run runAllTests() from the Apps Script editor.
 */

function getSystemTests_() {
  return [
    testIsoDateValidation_,
    testEventValidation_,
    testStoredDateNormalization_,
    testDynamicEventDateRequirements_,
    testQuarterlyPeriodicity_,
    testUiContract_,
    testUnifiedEventEditorContract_,
    testEventTypeMultipleCalendarKinds_,
    testMenuProgressPlan_,
    testSetupIdempotency_,
    testSchema005Migration_,
    testSetupMenuStepExecution_,
    testBootstrap005Contract_,
    testCalendarTypeSeed_,
    testEventTypeSeedIdempotency_,
    testEventTypeCrudRoundTrip_,
    testEventCrudRoundTrip_,
    testAuditQuantityProgress_,
    testIncompleteEventAudit_,
    testSchoolDayTransannualModel_,
    testAuditRoundTrip_,
    testSchoolPeriodIndependentObligations_,
    testHolidayValidation_,
    testHolidayCrudAndHistory_,
    testFixedHolidaySubtractsSchoolDay_,
    testOverlappingHolidaysDoNotDoubleSubtract_,
    testVariableHolidayChecklistAndOccurrence_,
    testSchoolDayExceptionValidation_,
    testSchoolDayExceptionCountAndReplacement_,
    testSchoolDayExceptionOutsidePeriod_,
    testBeta2UiContract_,
    testBeta3UiContract_,
    testBeta4UiContract_,
    testEventTypeSchoolDayEffect_,
    testEventTypeVisualRole_,
    testNonSchoolEventSubtractsDay_,
    testSchoolEffectRestoresDay_,
    testExceptionAllowedOnHolidayWeekday_,
    testThemeSeedAndValidation_,
    testThemeCrudAndUniqueName_,
    testThemeDuplicateDraft_,
    testThemeMonthsPerPage_,
    testThemeRoleColorResolution_,
    testLivePreviewUsesTheme_,
    testPreviewYearsFollowSchoolDayRecords_,
    testLivePreviewPagination_,
    testPv9PdfPaginationAndRepeatingFurnitureContract_,
    testThemeGeneratorContrast_,
    testDarkThemeReadability_,
    testThemeImageBackgroundValidation_,
    testDefaultInstitutionalLogoSeed_,
    testCalendarTitleRoundTrip_,
    testPreviewRendersEventColors_,
    testNationalHolidayImportRules_,
    testBeta5UiContract_,
    testPdfColorPreservationContract_,
    testThemeConflictRecoveryContract_,
    testBeta5Bg1EventTypeSaveUnlockContract_,
    testBeta5Bg2ThemeCascadeContract_,
    testBeta5Bg3CalendarTitleEditorContract_,
    testBeta5Bg4DarkThemeApplicationContract_,
    testDeleteImpactSnapshot_,
    testCascadeDeleteUiContract_,
    testBeta5Bg5HolidayDeleteButtonStateContract_,
    testBeta5Bg6HolidayImportRefreshAfterDeleteContract_,
    testBeta5Bg6HolidayImportPersistedState_,
    testBeta5Bg7NewEventEditorReadyContract_,
    testBeta5Bg8SpecialEventEditorReadyContract_,
    testBeta5Bg9UiAvailabilityContract_,
    testBeta5Bg9ProcessingReleaseContract_,
    testBeta5Bg10GlobalUnlockContract_,
    testBeta5Bg10PostProcessingOrderContract_,
    testBeta5Bg11CalendarGridBordersContract_,
    testBeta5Bg12SelectionHighlightHookContract_,
    testPv1ProjectVersionSchemaContract_,
    testPv1ProjectVersionStateInvariantContract_,
    testPv2ProjectWorkspaceContract_,
    testPv2ProjectUiContract_,
    testPv3FinalizationReportContract_,
    testPv3FinalizationUiContract_,
    testPv4PublicationSnapshotContract_,
    testPv4ImmutableVersionUiContract_,
    testPv4MutationGuardContract_,
    testPv5RectificationCloneContract_,
    testPv5RectificationUiContract_,
    testPv5CloneFailureCleanupContract_,
    testPv6AtomicPublicationContract_,
    testPv6RectificationReasonPublicationUiContract_,
    testPv7SnapshotChunkingContract_,
    testPv7FinalizationFreezeContract_,
    testPv7MutationGuardCoverageContract_,
    testPv7UiAvailabilityAndReadOnlyContract_,
    testPv7ErrorInductionInvariantContract_,
    testPv7MeasuredProgressContract_,
    testPv8ProjectsTabsContract_,
    testPv8HeaderActionsAndSettingsContract_,
    testPv8WeekdayHeaderTypographyContract_,
    testPv10VersionActionVisibilityAndLanguageContract_,
    testPv11SetupChoiceAndCleanBaseContract_,
    testPv11SetupSeedCatalogContract_,
    testPv12ResetPreflightSafetyContract_,
    testPv12EmptyWorkspaceAvailabilityContract_,
    testPv13FirstProjectWorkspaceSyncContract_,
    testPv14RecessoAndUberlandiaSeedContract_,
    testPv15ProjectReconciliationAndWatchdogContract_,
    testPv15SettingsCrudProfessionalContract_,
    testPv17SingleContextFeedbackContract_,
    testPv17EventSaveCanonicalLockContract_,
    testPv17DeletedVersionNoPartialWrite_,
    testPv17PreviewPeriodEndpointsAndDateRangeContract_,
    testPv17PreviewPageOverflowContract_,
    testPv17AcademicWeekAndEventsDiversosSeedContract_,
    testPv18PrintThemeFidelityContract_,
    testPv19PreviewContextFeedbackContract_,
    testPv20ProjectHardDeleteContract_,
    testPv21HardeningAndRollbackContract_,
    testPv22ThemeCatalogDecouplingContract_,
    testPv22ThemeCatalogRoundTripWithoutCalendar_,
    testPv22ThemeFreezeAndApplyBridgeContract_,
    testPv23PrintOrientationAndMarginsContract_,
    testR6ExplicitThemePageOrientationContract_,
    testR7PreviewPdfAbandonLifecycleContract_,
    testR8PreviewPrintParityAndSchoolPeriodMarkersContract_,
    testR9RectificationAtomicityAndReconciliationContract_,
    testR9ProjectsDrawerCanonicalRefreshContract_,
    testR9PreviewOnlyOperationShieldContract_,
    testR9FinalizationReportProfessionalUiContract_,
    testPv23DensePrintFidelityContract_,
    testPv24PrintOverflowSplitContract_,
    testPv24PrintOnlySplitAndTooltipContract_,
    testPv25HolidayOccurrenceLastAuthorizedWriteWins_,
    testPv25HolidayChecklistFreshOccurrenceContract_,
    testPv25EventDrawerCompletionContract_,
    testPv25BatchEventUiContract_,
    testPv25BatchEventAtomicRoundTrip_,
    testPv26MonthSchoolDayVisibleRangeContract_,
    testPv27EventSelectionPreservationContract_,
    testPv27ContextualDatesAndSchoolDayCounterContract_,
    testPv27PartialAuditResumeContract_,
    testPv27AuditOrderingAndFilterContract_,
    testPv27FrozenAuditContract_,
    testPv27QuantityRuleTextContract_,
    testPv27HolidaySeedDedupContract_,
    testPv28ServidorPublicoSeedContract_,
    testPv28ProjectScopedChecklistRuleContract_,
    testPv28LegacyRuleMigrationContract_,
    testPv28EventTypeRuleUiSimplificationContract_,
    testPv28AuditCacheContract_,
    testPv28EventChecklistContextContract_,
    testPv28EventTypeFullCalendarCompatibilityContract_,
    testPv29CollaborationSchemaContract_,
    testPv29UserCrudAndProjectRoleContract_,
    testPv29CollaborationPermissionContract_,
    testPv29SuggestionChecklistRecalculationContract_,
    testPv29RectificationSuggestionImmutabilityContract_,
    testPv29CollaborationNotificationContract_,
    testPv29CollaborationUiContract_,
    testPv29ServidorPublicoSemanticAliasContract_,
    testR22EmailCodeAuthenticationContract_,
    testR22AuthenticatedRpcContract_,
    testR22UsersHorizontalTableLayoutContract_,
    testR23UsersGlobalOnlyAndSortingContract_,
    testR23ProjectTeamDrawerContract_,
    testR23CollaborationBootstrapAndPendingFilterContract_,
    testR23CollaborationReviewAndRectificationGuidanceContract_,
    testR23AuthenticationHandoffAndVisibleIdentityContract_,
    testR28CollaboratorReadOnlyAuditContract_,
    testR28ExplicitProjectChooserContract_,
    testR28ContextFeedbackLifecycleContract_,
    testR28PdfProgressReleaseContract_,
    testR28EventAgendaSpecialGroupFilterContract_,
    testR28PublicAgendaProgressLocationContract_,
    testR29ExecutionCacheContract_,
    testR29SetupFastPathContract_,
    testR29DerivedAcademicCacheContract_,
    testR29AsyncCollaborationNotificationContract_,
    testR29FocusedChecklistStateContract_,
    testR29ProgressPollingFastPathContract_,
    testR29NotificationBatchQueueContract_,
    testR29BatchMutationContract_,
    testR30NoGoogleSessionIdentityContract_,
    testR30PublicEmailAccessContract_,
    testR30SameFrameLoginContract_,
    testR30TokenCutoverContract_,
    testR30ChallengeRevalidationContract_,
    testR30UserCrudIdentityIsolationContract_,
    testR31CollaborationDecisionAndRemovalSafetyContract_,
    testR31ThemeWeekendAndCellEventDisplayContract_,
    testR31ThemeSurfaceParityContract_,
    testR31UnlimitedEventTypeColorsContract_,
    testR32ProjectEditLeaseSchemaAndOwnershipContract_,
    testR32ProjectEditLeaseConcurrencyContract_,
    testR32MutationAndSuggestionFallbackContract_,
    testR32PresenceAndLeaseUiContract_,
    testR33HelpInjectionContract_,
    testR33HelpCatalogContract_,
    testR33HelpPanelAccessibilityContract_,
    testR33HelpAlertBridgeContract_,
    testR34AuthenticatedHtmlInjectionRegression_,
    testR35InstallerCopyGuardContract_,
    testInstallerMenuOrder_,
    testInstallerPreparationSafety_,
    testInstallerCopyInstallationSafety_,
    testFolhinhaIdentityHandoff_,
    testFolhinhaInstallerIdentityIsolation_,
    testR35InstallerCoreDefaultsContract_,
    testR36InstallerUxContract_,
    testR37OptionalFeaturesContract_,
    testR38InstallerCompletionContract_,
    testR38InstallerLocalityAndRecoveryContract_,
    testR48InstallerTimezoneInvariantContract_,
    testR39ProjectDistributionExportContract_,
    testR40ChecklistMaterializationContract_,
    testR40ProjectDistributionImportContract_,
    testR40ImportPermissionContract_,
    testR40ImportUxContract_,
    testR42StrictEnumValidationContract_,
    testR42FinalizationRawDateIntegrityContract_,
    testR42ThemeInputHardeningContract_,
    testR42ValidationPerformanceContract_,
    testR42ImportPreflightHardeningContract_,
    testR20UserSavingFeedbackScopeContract_,
    testR20SettingsMenuRestorationContract_,
    testR22ActiveCalendarSessionIsolationContract_,
    testPdfRegra086SameDateCompactionContract_,
    testPdfRegra086AdaptationOrderContract_,
    testPdfRegra086NoContentDropAndCommunicationContract_,
    testPdfRegra086PhysicalWidthMeasurementContract_,
    testPdfRegra086VariableFooterReserveContract_,
    testPdfRegra086FlowPhysicalHeightContract_,
    testPdfRegra086ExtremeSingleTitlePaginationContract_,
    testSchoolDayTargetsAndChecklistContract_,
    testIgnoredAuditCountsAsCompletedContract_,
    testAuditQuantityRuleTextContract_,
    testSchoolDayPeriodScopedSummaryContract_,
    testSchoolDayTargetUiContract_,
    testSchoolDayPreviewFootnoteContract_,
    testCompactSchoolDayFooterCounts_,
    testCompactSchoolDayFooterSurfaceParity_,
    testCompactSchoolDayFooterPageScope_,
    testMonthlyTablesOmitLegacySchoolDayFooter_,
    testUx1ModalArchitectureContract_,
    testUx2EventTypeFocusedCrudContract_,
    testUx3ThemeFocusedCrudContract_,
    testUx4RemainingModalCrudContract_,
    testUx5CalendarComfortContract_,
    testUx6EventEditorComfortContract_,
    testUx7ThemeGeneratorComfortContract_,
    testUx8VisualConsolidationContract_,
    testUx9ModalTopActionsContract_,
    testUx9SelectionHighlightContract_,
    testUx9ThemeProgressiveEditorContract_,
    testUx9EventVisualFilterContract_,
    testUx9ListViewContract_,
    testUx10ThemeTabsContract_,
    testUx10PdfUsesExactUserEventColor_,
    testThemeColorSchemeGenerator_,
    testUx11ThemeColorSchemeControlContract_,
    testGlobalCascadeMutationContract_,
    testPv12DefaultEventTypeBaseline_,
    testPv12CanonicalSchoolPeriods_,
    testPv12SchoolDayModalHasNoPeriodRegistry_,
    testPv12CancelableLongOperations_,
    testPv12PdfFootnoteLabelsAndNoCrop_,
    testPublicAgendaC1SchemaAndFacadeContract_,
    testPublicAgendaC1StateContract_,
    testPublicAgendaC1RecipientValidationContract_,
    testPublicAgendaC1TemplatesAndGlobalIdentityContract_,
    testPublicAgendaC2ExecutorSecurityContract_,
    testPublicAgendaC2PublishedProjectionContract_,
    testPublicAgendaC2DiagnosticAndSyncContract_,
    testPublicAgendaC2TestMonthAndDeletionContract_,
    testPublicAgendaC3ProfessionalUiContract_,
    testPublicAgendaC3NoAutomaticCommunicationContract_,
    testPublicAgendaC3WysiwygAndTemplateSafetyContract_,
    testPublicAgendaC3ExplicitSendAndSenderContract_,
    testPublicAgendaC3AuditPayloadContract_,
    testPublicAgendaC4FailureDemotesStateContract_,
    testPublicAgendaC4DistributedCompensationContract_,
    testR15RectificationOnlyCloneUxContract_,
    testPublicAgendaC4CreateRaceAndPublicationChangeContract_,
    testPublicAgendaC4MetadataReconciliationContract_,
    testR15RectificationSnapshotCloneIntegrityContract_,
    testR15RectificationRecoveryPreservesDraftContract_,
    testR15PublicAgendaSectionOrderContract_,
    testR15PublicAgendaOfficialActivationLinksContract_,
    testR15RectificationInternalFailureUxContract_,
    testR16RectificationLiteralEqualsRuntimeContract_,
    testR17PublicAgendaExternalMissingStateContract_,
    testR17PublicAgendaRecreationContract_,
    testR17PublicAgendaCommunicationLiveLinkGuardContract_,
    testR17PublicAgendaGuidedCloudSetupContract_,
    testR17SetupGracefulDegradationContract_,
    testR17GmailApiRemediationContract_,
    testR17PublicAgendaOwnerDeletionUxContract_,
    testR18PublicAgendaStableRecreateRpcContract_,
    testR14FrozenDrawerFeedbackContract_,
    testR14MailPreviewProfessionalLayoutContract_,
    testR14GuidedPublicAgendaActivationContract_,
    testR14ExecutorDiscoverySecurityContract_,
    testR14ExecutorSurfaceIsolationContract_,
    testR14OfficialCalendarReferenceContract_,
    testR14SchemaMigrationContract_
  ];
}


/** PV29 — schema de usuários, vínculos e colaboração é gerenciado pelo setup. */
function testPv29CollaborationSchemaContract_() {
  ['USERS','PROJECT_MEMBERS','COLLABORATION_SUGGESTIONS','COLLABORATION_NOTIFICATIONS'].forEach(function(name){
    assertTrue_(Array.isArray(DB_SCHEMA[name]), 'Tabela PV29 ausente do DB_SCHEMA: '+name+'.');
  });
  ['id','name','email','profile','status','version'].forEach(function(column){assertTrue_(DB_SCHEMA.USERS.indexOf(column)!==-1,'USERS deve possuir '+column+'.');});
  ['project_id','user_id','user_email','role','status'].forEach(function(column){assertTrue_(DB_SCHEMA.PROJECT_MEMBERS.indexOf(column)!==-1,'PROJECT_MEMBERS deve possuir '+column+'.');});
  ['project_id','calendar_id','kind','action','target_event_id','checklist_event_type_id','checklist_state_before','checklist_state_after','status','rectification_calendar_id'].forEach(function(column){assertTrue_(DB_SCHEMA.COLLABORATION_SUGGESTIONS.indexOf(column)!==-1,'COLLABORATION_SUGGESTIONS deve possuir '+column+'.');});
  ['suggestion_id','event_type','recipient_email','dedupe_key','status','attempt_count','last_error'].forEach(function(column){assertTrue_(DB_SCHEMA.COLLABORATION_NOTIFICATIONS.indexOf(column)!==-1,'COLLABORATION_NOTIFICATIONS deve possuir '+column+'.');});
  assertTrue_(String(migrateUsersAndProjectMembers_).indexOf('SUPERUSER_EMAIL_PROPERTY')!==-1,'Migração deve reaproveitar o Superusuário legado.');
  assertTrue_(String(migrateUsersAndProjectMembers_).indexOf('ADMINISTRATOR_EMAILS_PROPERTY')!==-1,'Migração deve reaproveitar Administradores legados.');
}

/** PV29 — CRUD global e papel por Projeto formam duas camadas de autorização. */
function testPv29UserCrudAndProjectRoleContract_() {
  const save=String(saveSystemUser), access=String(getProjectAccessContext_), member=String(saveProjectMember);
  assertTrue_(save.indexOf('countOtherActiveSuperusers_')!==-1,'CRUD deve proteger o último Superusuário ativo.');
  assertTrue_(save.indexOf("operator.isAdministrator && !operator.isSuperuser")!==-1,'Administrador não pode administrar Superusuário.');
  assertTrue_(save.indexOf('verifyUserSecurityCode_')!==-1,'Alteração sensível entre Superusuários deve exigir 2FA.');
  assertTrue_(access.indexOf('memberRole === PROJECT_MEMBER_ROLE.EDITOR')!==-1,'Papel EDITOR do Projeto deve conceder edição/revisão.');
  assertTrue_(access.indexOf('canSuggest = hasProjectAccess')!==-1||access.indexOf('canSuggest: canSuggest')!==-1,'Membro ativo do Projeto deve poder sugerir sem conceder sugestão ao acesso Público.');
  assertTrue_(member.indexOf('normalizeProjectMemberRole_')!==-1&&member.indexOf('role:role')!==-1,'CRUD de acesso deve normalizar e persistir papel de Projeto explícito.');
}

/** PV29 — colaboradores veem Projetos vinculados, mas escrita direta exige Editor/Admin/Super. */
function testPv29CollaborationPermissionContract_() {
  const guard=String(calendarVersionMutationFailure_), list=String(listProjects_), create=String(createCalendarProject);
  assertTrue_(guard.indexOf('getProjectAccessContext_')!==-1&&guard.indexOf('.canEdit')!==-1,'Guardião de mutação deve bloquear escrita direta de colaborador.');
  assertTrue_(list.indexOf("getRequiredSheet_('PROJECT_MEMBERS')")!==-1&&list.indexOf('memberIndex')!==-1&&list.indexOf('globalManager || !!memberIndex')!==-1,'Lista de Projetos deve respeitar vínculo do usuário sem consulta repetida por Projeto.');
  assertTrue_(create.indexOf('isSuperuser')!==-1&&create.indexOf('isAdministrator')!==-1,'Criação de Projeto deve permanecer restrita a Administradores/Superusuários.');
  assertTrue_(String(getBootstrapData).indexOf('!access.authenticated')!==-1,'Bootstrap RPC deve bloquear identidade sem acesso autenticado por e-mail.');
}

/** PV29 — checklist só muda por dados reais e auditoria recalculada após incorporação. */
function testPv29SuggestionChecklistRecalculationContract_() {
  const review=String(reviewCollaborationSuggestion), state=String(getChecklistStateForEventType_), apply=String(applyDraftSuggestionMutationUnderLock_);
  assertTrue_(review.indexOf('applyDraftSuggestionMutationUnderLock_')!==-1,'Aceite em RASCUNHO deve primeiro incorporar a mutação real.');
  assertTrue_(review.indexOf('getChecklistStateForEventType_')!==-1,'Depois da incorporação deve recalcular o estado da obrigação.');
  assertTrue_(review.indexOf('buildCalendarAudit_')!==-1,'Resposta deve devolver auditoria oficial recalculada.');
  assertTrue_(state.indexOf('auditEventType_')!==-1&&state.indexOf('getCalendarAuditRuleMap_')!==-1,'Estado histórico da obrigação deve derivar da mesma regra oficial, sem recalcular toda a checklist.');
  assertFalse_(apply.indexOf('ATENDIDA')!==-1,'Mutação de sugestão não pode marcar checklist artificialmente como ATENDIDA.');
}

/** PV29 — pedido aceito sobre PUBLICADO não toca a versão; incorporação exige nova retificação RASCUNHO derivada da fonte. */
function testPv29RectificationSuggestionImmutabilityContract_() {
  const submit=String(submitCollaborationSuggestion), review=String(reviewCollaborationSuggestion), incorporate=String(incorporateRectificationSuggestion);
  assertTrue_(submit.indexOf('CALENDAR_VERSION_STATUS.PUBLISHED')!==-1&&submit.indexOf('COLLABORATION_KIND.RECTIFICATION')!==-1,'Versão PUBLICADA deve receber apenas pedido de retificação.');
  assertTrue_(review.indexOf('collaborationDecisionAppliesDraftMutation_')!==-1&&String(collaborationDecisionAppliesDraftMutation_).indexOf('COLLABORATION_KIND.DRAFT_EVENT')!==-1,'Aceite só pode aplicar evento diretamente quando a sugestão pertence ao RASCUNHO.');
  assertTrue_(incorporate.indexOf("String(target.sourceVersionId||'')!==String(source.id||'')")!==-1,'Incorporação deve exigir que a nova versão derive da PUBLICADA original.');
  assertTrue_(incorporate.indexOf('calendarVersionMutationFailure_(target)')!==-1,'Nova versão precisa continuar RASCUNHO e editável ao incorporar.');
  assertTrue_(String(publishCalendarVersion).indexOf('reclassifyPendingDraftSuggestionsAfterPublication_')!==-1,'Publicação deve preservar sugestões pendentes do antigo RASCUNHO como pedidos de retificação.');
}

/** PV29 — e-mail é transacional, deduplicado e falha de Gmail não desfaz a sugestão. */
function testPv29CollaborationNotificationContract_() {
  const queue=String(queueSuggestionNotificationsForRecipients_), process=String(processPendingCollaborationNotifications_), submit=String(submitCollaborationSuggestion), send=String(sendSystemHtmlEmail_);
  assertTrue_(queue.indexOf('dedupe_key')!==-1&&queue.indexOf("suggestion.id||''")!==-1,'Notificação deve possuir chave de deduplicação por sugestão/evento/destinatário.');
  assertTrue_(process.indexOf('COLLABORATION_NOTIFICATION_STATUS.FAILED')!==-1&&process.indexOf('catch(error)')!==-1,'Falha de envio deve ser registrada sem lançar sobre a operação já persistida.');
  assertTrue_(submit.indexOf("appendObject_(getRequiredSheet_('COLLABORATION_SUGGESTIONS')") < submit.indexOf("queueSuggestionNotifications_(record,'SUBMITTED')"),'Sugestão deve ser persistida antes de tentar notificar.');
  assertTrue_(send.indexOf('MailApp.sendEmail')!==-1,'Notificações internas devem usar MailApp e não depender de habilitar Gmail API no Google Cloud.');
}

/** PV29 — UI entrega os fluxos de sugestão, revisão e administração de usuários sem alert nativo. */
function testPv29CollaborationUiContract_() {
  const html=HtmlService.createHtmlOutputFromFile('index').getContent();
  ['suggestDatesBtn','suggestionsBtn','suggestionsCount','collaborationDrawer','collaborationForm','collaborationList','collaborationProposalSummary','usersToolBtn','usersModal','usersList','userForm','projectsTabTeam','projectsPanelTeam'].forEach(function(id){
    assertTrue_(html.indexOf('id="'+id+'"')!==-1,'UI PV29 ausente: '+id+'.');
  });
  assertTrue_(html.indexOf('function reviewSelectedCollaboration')!==-1,'Painel deve analisar e incorporar sugestões sem trocar de superfície.');
  assertTrue_(html.indexOf('function saveProjectTeamFromPanel')!==-1,'Vínculos de Projeto devem ser administrados na aba Equipe do Projeto.');
  assertFalse_(html.indexOf('id="userProjectAccessCard"')!==-1,'CRUD global de usuários não deve condensar permissões de Projeto.');
  assertFalse_(/\balert\s*\(/.test(html),'PV29 não pode reintroduzir alert() nativo.');
}

/** PV29 — BUG-081: variante real com sufixo “ponto facultativo” converge ao mestre canônico. */
function testPv29ServidorPublicoSemanticAliasContract_() {
  const definition=DEFAULT_SUPPLEMENTARY_HOLIDAYS.find(function(item){return item.name==='Dia do Servidor Público';});
  assertTrue_(!!definition,'Seed complementar do Dia do Servidor Público deve existir.');
  assertTrue_((definition.aliases||[]).indexOf('Dia do Servidor Público - (ponto facultativo)')!==-1,'Variante observada na base real deve ser alias semântico explícito.');
  assertTrue_(holidaySeedMatches_({name:'Dia do Servidor Público - (ponto facultativo)',scope:'NACIONAL'},definition),'Alias com sufixo deve ser reconhecido pelo seed.');
  const seed=String(seedSupplementaryHolidayCatalog_);
  assertTrue_(seed.indexOf('matchingIndexes.forEach')!==-1&&seed.indexOf('name:definition.name')!==-1,'Todos os mestres equivalentes devem ser canonicalizados antes do saneamento.');
  assertTrue_(String(sanitizeDuplicateHolidayCatalog_).indexOf('conflicts')!==-1,'Saneamento deve preservar segurança quando ocorrências equivalentes tiverem datas conflitantes.');
}


/** R30 — login por e-mail/código é a única identidade da aplicação. */
function testR22EmailCodeAuthenticationContract_() {
  const identity=String(getRequestIdentity_),request=String(requestAccessCode),confirm=String(confirmAccessCode),entry=String(doGet),authSource=String(resolveAuthPrincipalByEmail_);
  assertTrue_(identity.indexOf('AUTH_IDENTITY_OVERRIDE_')!==-1&&identity.indexOf('UNAUTHENTICATED')!==-1,'Sem token explícito a aplicação deve permanecer sem identidade.');
  ['getGoogleActiveEmail_','getTemporaryAuthKey_','getActiveUser','getEffectiveUser','getTemporaryActiveUserKey'].forEach(function(name){
    assertFalse_(identity.indexOf(name)!==-1||request.indexOf(name)!==-1||confirm.indexOf(name)!==-1,'Login não pode depender de sessão Google: '+name+'.');
  });
  assertTrue_(authSource.indexOf('getActiveAuthUserByEmail_')!==-1&&authSource.indexOf('isPublicAccessEnabled_')!==-1,'A autorização do e-mail deve consultar USERS e a política pública da base.');
  assertTrue_(request.indexOf('challengeId')!==-1&&request.indexOf('MAX_REQUESTS_EMAIL')!==-1&&request.indexOf('sendSystemHtmlEmail_')!==-1,'Solicitação deve gerar desafio próprio, limitar abuso e enviar o código por e-mail.');
  assertTrue_(confirm.indexOf('MAX_CODE_ATTEMPTS')!==-1&&confirm.indexOf('mintAuthAccessToken_')!==-1&&confirm.indexOf('applicationHtml')!==-1,'Confirmação deve limitar tentativas, emitir token próprio e devolver a aplicação autenticada sem redirect.');
  assertTrue_(entry.indexOf("createHtmlOutputFromFile('auth')")!==-1&&entry.indexOf('validateAuthAccessToken_')===-1,'Toda abertura GET deve começar pela tela própria de login; GET não pode inferir identidade.');
  const authHtml=HtmlService.createHtmlOutputFromFile('auth').getContent();
  ['requestAccessCode(selectedEmail)','confirmAccessCode(selectedEmail,value,challengeId)','getAuthenticatedApplicationHtml','document.write(content)','CALENDAR_ACADEMIC_ACCESS_TOKEN_V2'].forEach(function(text){assertTrue_(authHtml.indexOf(text)!==-1,'Tela de acesso deve conter '+text+'.');});
  ['window.location.replace','window.open','script.google.com','Google identificou'].forEach(function(text){assertFalse_(authHtml.indexOf(text)!==-1,'Login não pode navegar/depender de Google: '+text+'.');});
}

/** R30 — interface autenticada propaga obrigatoriamente o token próprio para todas as RPCs. */
function testR22AuthenticatedRpcContract_() {
  const html=HtmlService.createHtmlOutputFromFile('index').getContent(),rpc=String(authenticatedRpc),identity=String(getRequestIdentity_);
  assertTrue_(html.indexOf('function authenticatedRun()')!==-1&&html.indexOf('authenticatedRpc(String(property),args,calAccessToken,calClientInstanceId)')!==-1,'Cliente deve encapsular chamadas RPC com o token próprio da sessão e a identidade da aba.');
  assertTrue_(html.indexOf('CAL_SERVER_BOOTSTRAP_ACCESS_TOKEN')!==-1&&String(createApplicationHtml_).indexOf('__CAL_SERVER_BOOTSTRAP_ACCESS_TOKEN__')!==-1,'Token validado deve ser injetado na aplicação autenticada.');
  assertTrue_(html.indexOf('const rawGasRun = google.script.run')!==-1,'Ponte autenticada deve preservar o mecanismo nativo google.script.run internamente.');
  assertTrue_(rpc.indexOf("if(!supplied)throw new Error('AUTH_REQUIRED")!==-1&&rpc.indexOf('validateAuthAccessToken_(supplied)')!==-1&&rpc.indexOf('withRequestIdentityOverride_')!==-1,'RPC deve exigir token explícito, validar e executar com identidade própria.');
  assertFalse_(rpc.indexOf('getGoogleActiveEmail_')!==-1||identity.indexOf('getGoogleActiveEmail_')!==-1,'Não pode existir fallback para Conta Google na ponte autenticada.');
  const bridge=String(getAuthenticatedRpcHandler_);
  assertTrue_(bridge.indexOf("case 'savePublicAgendaProjectConfig'")!==-1&&bridge.indexOf("case 'updatePublicAgendaMetadata'")!==-1,'Ponte autenticada deve preservar os entrypoints existentes de configuração/metadados da Agenda Pública.');
}

/** R22 — Usuários e Acessos usa cadastro/busca superiores e tabela inferior. */
function testR22UsersHorizontalTableLayoutContract_() {
  const html=HtmlService.createHtmlOutputFromFile('index').getContent();
  assertTrue_(html.indexOf('class="admin-header users-admin-header"')!==-1&&html.indexOf('users-header-feedback')!==-1,'Feedback de usuários deve compartilhar a faixa superior com o título.');
  assertTrue_(html.indexOf('class="users-top-pane"')!==-1&&html.indexOf('class="users-search-row"')!==-1,'Cadastro e busca devem permanecer na região superior fixa do módulo.');
  assertTrue_(html.indexOf('class="users-table"')!==-1&&html.indexOf('<tbody id="usersList"></tbody>')!==-1,'Usuários cadastrados devem ser renderizados como tabela na região inferior.');
  assertTrue_(html.indexOf('#usersModal .form-grid-2 { grid-template-columns:minmax(0,1fr) minmax(0,1fr)')!==-1,'Formulário de usuários deve usar duas colunas horizontais em desktop.');
  const renderStart=html.indexOf('function renderUsersList()'),renderEnd=html.indexOf('function clearUserEditor()',renderStart),render=html.slice(renderStart,renderEnd);
  assertTrue_(render.indexOf("document.createElement('tr')")!==-1&&render.indexOf('users-table-pill')!==-1,'Renderização deve produzir linhas tabulares sutis em vez de cartões verticais.');
}


/** R23 — CRUD global não mistura participação em Projetos e mantém busca geral + ordenação local. */
function testR23UsersGlobalOnlyAndSortingContract_() {
  const html=HtmlService.createHtmlOutputFromFile('index').getContent(),data=String(getUsersAdminData);
  assertFalse_(html.indexOf('id="userProjectAccessCard"')!==-1,'Usuários e Acessos não deve exibir permissões por Projeto.');
  assertTrue_(html.indexOf('id="projectsTabTeam"')!==-1&&html.indexOf('id="projectTeamForm"')!==-1,'Permissões por Projeto devem viver na aba Equipe do Projeto.');
  assertTrue_(html.indexOf('data-user-sort="name"')!==-1&&html.indexOf('function toggleUsersSort')!==-1,'Cabeçalhos da tabela de usuários devem permitir ordenação crescente/decrescente.');
  assertTrue_(html.indexOf('id="usersSearch"')!==-1,'A busca geral de usuários deve permanecer no topo.');
  assertFalse_(data.indexOf("getRequiredSheet_('PROJECT_MEMBERS')")!==-1,'Bootstrap do CRUD global não deve carregar vínculos de Projeto.');
}

/** R23 — criador do Projeto gerencia sua equipe e novos integrantes podem ser criados no contexto do Projeto. */
function testR23ProjectTeamDrawerContract_() {
  const team=String(getProjectTeamData),manager=String(requireProjectTeamManager_),save=String(saveProjectTeamMember),create=String(createCalendarProject);
  assertTrue_(team.indexOf('created_by')!==-1&&team.indexOf('canManageTeam')!==-1,'Equipe deve reconhecer o criador do Projeto como gestor da composição.');
  assertTrue_(manager.indexOf('isCreator')!==-1,'Guardião da equipe deve permitir o criador além de Administradores/Superusuários.');
  assertTrue_(save.indexOf("profile:USER_PROFILE.COLLABORATOR")!==-1,'Inclusão por Equipe deve poder criar um usuário comum ativo quando o e-mail ainda não existir.');
  assertTrue_(create.indexOf("role:PROJECT_MEMBER_ROLE.EDITOR")!==-1,'Criador do Projeto deve receber vínculo explícito de Editor.');
}

/** R23 — colaboração usa uma carga única, distingue loading/vazio e filtra PENDENTE de forma coerente. */
function testR23CollaborationBootstrapAndPendingFilterContract_() {
  const html=HtmlService.createHtmlOutputFromFile('index').getContent(),server=String(getCollaborationScreenData),normalize=String(normalizeCollaborationStatusFilter_);
  assertTrue_(html.indexOf('.getCollaborationScreenData(state.calendarRecord.id)')!==-1,'Painel deve carregar sugestões/contexto por um bootstrap único.');
  assertTrue_(html.indexOf('state.collaborationLoading')!==-1&&html.indexOf('Carregando sugestões…')!==-1,'Estado de carregamento deve ser explícito e distinto de lista vazia.');
  assertTrue_(html.indexOf("wanted==='PENDING'||wanted==='PENDENTE'")!==-1,'Filtro local Pendentes deve reconhecer o status persistido PENDENTE.');
  assertTrue_(normalize.indexOf("normalized==='PENDING'||normalized==='PENDENTE'")!==-1,'Backend deve normalizar PENDING/PENDENTE no mesmo contrato.');
  assertTrue_(server.indexOf('buildCollaborationItemsForClient_')!==-1,'Bootstrap deve devolver detalhes enriquecidos da proposta.');
}

/** R23 — análise é autorizada na ponte RPC e PUBLICADO orienta retificação em vez de Forbidden cru. */
function testR23CollaborationReviewAndRectificationGuidanceContract_() {
  const html=HtmlService.createHtmlOutputFromFile('index').getContent(),handler=String(getAuthenticatedRpcHandler_),review=String(reviewCollaborationSuggestion),incorporate=String(incorporateRectificationSuggestion);
  assertTrue_(handler.indexOf("case 'reviewCollaborationSuggestion'")!==-1&&handler.indexOf("case 'incorporateRectificationSuggestion'")!==-1,'Aceite/recusa/incorporação precisam estar autorizados na ponte RPC.');
  assertTrue_(review.indexOf('RECTIFICATION_DRAFT_REQUIRED')!==-1,'Aceitar pedido ligado à publicação deve retornar orientação de fluxo, não erro genérico de autorização.');
  assertTrue_(incorporate.indexOf('COLLABORATION_STATUS.PENDING')!==-1&&incorporate.indexOf('COLLABORATION_STATUS.ACCEPTED')!==-1,'Na retificação aberta, pedido pendente ou previamente aceito deve poder ser incorporado.');
  assertTrue_(html.indexOf('collaborationRectificationGuidance')!==-1&&html.indexOf('Criar ou abrir retificação')!==-1,'Editor deve receber orientação acionável para abrir/criar a retificação.');
  assertTrue_(html.indexOf('O que será feito no calendário')!==-1&&html.indexOf('Justificativa do colaborador')!==-1,'Revisão deve destacar claramente o conteúdo que será adicionado/alterado/removido.');
}

/** R30 — login confirmado substitui a tela no mesmo HtmlService e mantém identidade visível. */
function testR23AuthenticationHandoffAndVisibleIdentityContract_() {
  const auth=HtmlService.createHtmlOutputFromFile('auth').getContent(),html=HtmlService.createHtmlOutputFromFile('index').getContent(),entry=String(doGet);
  assertTrue_(auth.indexOf('renderApplicationHtml')!==-1&&auth.indexOf('document.open()')!==-1&&auth.indexOf('document.write(content)')!==-1,'Após confirmar o código, a aplicação deve substituir a tela de login no mesmo contexto HtmlService.');
  assertFalse_(auth.indexOf('window.location.replace')!==-1||auth.indexOf("'_top'")!==-1,'Transição autenticada não pode depender de navegação superior do sandbox.');
  ['accountBtn','accountName','accountMenuEmail','accountMenuProfile','accountMenuProjectRole','switchAccountBtn'].forEach(function(id){assertTrue_(html.indexOf('id="'+id+'"')!==-1,'Cabeçalho deve identificar sessão: '+id+'.');});
  assertTrue_(html.indexOf('function syncAuthenticatedUserDisplay')!==-1&&html.indexOf('function switchAuthenticatedAccount')!==-1,'Interface deve mostrar identidade e permitir entrar com outro e-mail.');
  assertTrue_(entry.indexOf("createHtmlOutputFromFile('auth')")!==-1&&entry.indexOf('parameter.login')===-1,'GET sempre deve abrir o login, sem parâmetros de identidade.');
}

/** R28 — Colaborador consulta Auditoria, mas nenhuma mutação direta pode ser oferecida ou aceita. */
function testR28CollaboratorReadOnlyAuditContract_() {
  const html=HtmlService.createHtmlOutputFromFile('index').getContent();
  const mutation=String(calendarVersionMutationFailure_),ignored=String(setCalendarAuditRuleIgnored),types=String(getEventTypesAdminData);
  const renderStart=html.indexOf('function renderAudit()'),renderEnd=html.indexOf('function syncAuditStatusFiltersFromControls()',renderStart),render=html.slice(renderStart,renderEnd);
  assertTrue_(render.indexOf("state.collaboration.access.canEdit")!==-1&&render.indexOf('Somente visualização')!==-1,'Auditoria deve derivar a edição do papel no Projeto e apresentar leitura explícita ao Colaborador.');
  assertTrue_(render.indexOf("if (auditCanEdit && item.kind === 'SCHOOL_DAY_TARGET'")!==-1,'Itens da checklist só podem abrir o editor quando o usuário pode editar.');
  assertTrue_(mutation.indexOf('if (!access.canEdit)')!==-1&&mutation.indexOf('Colaboradores podem usar Sugerir datas')!==-1,'Guardião central de mutações deve bloquear Colaborador no backend.');
  assertTrue_(ignored.indexOf('requireProjectEditor_')!==-1,'Alteração de ignorar/regra da Auditoria deve exigir Editor no backend.');
  assertTrue_(types.indexOf('requireProjectEditor_')!==-1,'Administração de regras/tipos no contexto do calendário deve exigir Editor.');
  const mode=StringFromHtmlFunction_(html,'function applyVersionInteractionMode()','function handleVersionPrimaryAction()');
  assertTrue_(mode.indexOf('el.toolsBtn.hidden=!(canEdit||canManageUsers)')!==-1,'Configurações deve desaparecer para quem não possui capacidade de edição/administração.');
}

/** R28 — inicialização nunca escolhe Projeto automaticamente; escolha é explícita e bloqueante. */
function testR28ExplicitProjectChooserContract_() {
  const html=HtmlService.createHtmlOutputFromFile('index').getContent(),startup=String(getStartupWorkspaceData),open=String(openProjectWorkspace),bootstrap=String(getBootstrapData);
  const boot=StringFromHtmlFunction_(html,'function boot()','function cacheElements()');
  assertTrue_(boot.indexOf('.getStartupWorkspaceData()')!==-1&&boot.indexOf('openProjectChooser()')!==-1,'Boot deve carregar somente a lista acessível e abrir o seletor explícito.');
  assertFalse_(boot.indexOf('.getBootstrapData(')!==-1,'Boot não pode materializar automaticamente um calendário.');
  assertTrue_(html.indexOf('id="projectChooserModal"')!==-1&&html.indexOf('Abrir projeto')!==-1&&html.indexOf('project.myRoleLabel')!==-1,'Modal inicial deve listar Projetos com papel e exigir Abrir projeto.');
  assertTrue_(startup.indexOf('projects:listProjects_()')!==-1,'Bootstrap inicial deve limitar-se à identidade e aos Projetos acessíveis.');
  assertTrue_(open.indexOf("updateOperationProgress_(progressToken,1,6")!==-1&&open.indexOf("updateOperationProgress_(progressToken,5,6")!==-1,'Carga do Projeto deve expor fases mensuráveis ao navegador.');
  assertTrue_(bootstrap.indexOf("const resolvedCalendarId = String(calendarId || '');")!==-1,'Bootstrap completo só pode resolver calendário explicitamente solicitado.');
  const chooser=StringFromHtmlFunction_(html,'function openSelectedProjectFromChooser()','function renderProjectContext()');
  assertTrue_(chooser.indexOf("label:'Projeto pronto para uso.'")!==-1&&chooser.indexOf('closeProjectChooser()')!==-1,'Seletor deve permanecer em primeiro plano até a Mesa estar efetivamente pronta.');
}

/** R28 — feedback contextual é visível, transitório e processamentos permanecem vivos enquanto ativos. */
function testR28ContextFeedbackLifecycleContract_() {
  const html=HtmlService.createHtmlOutputFromFile('index').getContent();
  assertTrue_(html.indexOf('class="topbar-feedback-slot"')!==-1,'Feedback da Mesa deve ocupar a barra superior do calendário.');
  assertFalse_(html.indexOf('@media(max-width:900px){.topbar-feedback-slot{display:none}}')!==-1,'Feedback global não pode desaparecer em telas menores.');
  const update=StringFromHtmlFunction_(html,'function updateGlobalFeedback(','function updateContextFeedback(');
  const context=StringFromHtmlFunction_(html,'function updateContextFeedback(','function setSaving(');
  assertTrue_(html.indexOf('setTimeout(function(){feedbackDismissTimers.delete(target);hideFn();},5000)')!==-1,'Mensagens transitórias devem desaparecer em no máximo cinco segundos.');
  assertTrue_(context.indexOf("close.textContent='Fechar'")!==-1,'Feedback em modal/painel deve oferecer fechamento explícito.');
  assertTrue_(update.indexOf("el.feedbackClose.hidden=stateKind==='processing'")!==-1,'Processamento não deve ser tratado como toast concluído.');
  assertTrue_(html.indexOf('R47_2_PROCESSING_PROGRESS')!==-1&&html.indexOf('context-feedback-progress')!==-1&&html.indexOf('indeterminate')!==-1,'Processamentos sem total conhecido devem comunicar atividade contínua por barra indeterminada, sem timer.');
  const saving=StringFromHtmlFunction_(html,'function setSaving(','function showFeedback(');
  assertTrue_(saving.indexOf("endedTarget.classList.contains('processing')")!==-1&&saving.indexOf("el.feedback.classList.contains('processing')")!==-1,'Encerrar uma operação deve remover qualquer feedback de processamento residual.');
  const auth=HtmlService.createHtmlOutputFromFile('auth').getContent();
  assertTrue_(auth.indexOf('feedbackTimer=setTimeout(hideFeedback,5000)')!==-1&&auth.indexOf('notice-progress')!==-1&&auth.indexOf('authProgress')!==-1&&auth.indexOf('feedbackHeartbeat')===-1,'Login deve obedecer ao mesmo ciclo de vida e mostrar barra animada durante operações remotas, sem contador de segundos.');
}

/** R28 — PDF publicado reporta progresso e encerra o estado de processamento após preparar o download. */
function testR28PdfProgressReleaseContract_() {
  const html=HtmlService.createHtmlOutputFromFile('index').getContent(),pdf=String(generateLivePreviewPdf);
  const flow=StringFromHtmlFunction_(html,'function downloadCurrentVersionPdf()','function finalizeCurrentVersion()');
  assertTrue_(flow.indexOf("beginMeasuredOperation('Gerando PDF da versão publicada")!==-1,'Geração de PDF deve usar progresso medido.');
  assertTrue_(flow.indexOf('setSaving(false)')!==-1&&flow.indexOf('PDF gerado com sucesso. O download foi iniciado no navegador.')!==-1,'Sucesso deve liberar a interface e substituir o processamento por conclusão visível.');
  ["updateOperationProgress_(progressToken,1,4","updateOperationProgress_(progressToken,2,4","updateOperationProgress_(progressToken,3,4","updateOperationProgress_(progressToken,4,4"].forEach(function(piece){assertTrue_(pdf.indexOf(piece)!==-1,'Backend do PDF deve publicar todas as fases: '+piece);});
}

/** R28 — filtro Eventos da agenda inclui tipos, feriados e dias letivos excepcionais, somente visualmente. */
function testR28EventAgendaSpecialGroupFilterContract_() {
  const html=HtmlService.createHtmlOutputFromFile('index').getContent();
  assertTrue_(html.indexOf('>Eventos da agenda <span class="event-filter-badge"')!==-1,'Botão deve representar os grupos exibidos na agenda.');
  assertTrue_(html.indexOf("EVENT_FILTER_HOLIDAYS='SPECIAL:HOLIDAY'")!==-1&&html.indexOf("EVENT_FILTER_SCHOOL_DAY_EXCEPTIONS='SPECIAL:SCHOOL_DAY_EXCEPTION'")!==-1,'Feriados e dias letivos excepcionais devem possuir grupos próprios.');
  const key=StringFromHtmlFunction_(html,'function eventFilterKeyForCalendarEvent_','function isTypeIdHiddenByVisualFilter');
  assertTrue_(key.indexOf("sourceKind==='HOLIDAY'")!==-1&&key.indexOf("sourceKind==='SCHOOL_DAY_EXCEPTION'")!==-1,'Eventos auxiliares precisam participar da mesma decisão de visibilidade.');
  const apply=StringFromHtmlFunction_(html,'function applyEventVisibilityFilter()','function updateEventFilterBadge()');
  assertFalse_(apply.indexOf("sourceKind || 'EVENT') !== 'EVENT'")!==-1,'Filtro não pode excluir feriados/exceções da aplicação visual.');
  assertTrue_(apply.indexOf("eventApi.setProp('display'")!==-1,'Ocultação deve continuar sendo exclusivamente visual, sem persistência acadêmica.');
  const aux=StringFromHtmlFunction_(html,'function syncAuxiliaryCalendarEvents()','function addHolidayCalendarEvent(');
  assertTrue_(aux.indexOf('applyEventVisibilityFilter();')!==-1,'Eventos auxiliares recriados ao navegar devem reaplicar imediatamente o filtro vigente.');
}

/** R28 — progresso especializado da Agenda Pública permanece no topo da gaveta que originou a ação. */
function testR28PublicAgendaProgressLocationContract_() {
  const html=HtmlService.createHtmlOutputFromFile('index').getContent();
  const feedback=html.indexOf('id="projectFeedback"'),progress=html.indexOf('id="publicAgendaProgress"'),tabs=html.indexOf('id="projectsTabs"');
  assertTrue_(feedback!==-1&&progress>feedback&&progress<tabs,'Progresso da Agenda Pública deve ficar no topo da gaveta, antes dos componentes das abas.');
  const finish=StringFromHtmlFunction_(html,'function setPublicAgendaBusy(','function publicAgendaOperationIsActive(');
  assertTrue_(finish.indexOf('el.publicAgendaProgress.hidden=!state.publicAgendaBusy')!==-1,'Fim do processamento deve retirar a barra especializada da tela.');
}

function StringFromHtmlFunction_(html,startMarker,endMarker){
  const start=html.indexOf(startMarker),end=html.indexOf(endMarker,start);
  return start!==-1&&end>start?html.slice(start,end):'';
}

/** R30 — nenhuma identidade interativa pode depender de Session/UserProperties Google. */
function testR30NoGoogleSessionIdentityContract_() {
  const sources=[String(getRequestIdentity_),String(authenticatedRpc),String(getAccessContext_),String(sendSystemHtmlEmail_),String(migrateUsersAndProjectMembers_),String(readUserActiveCalendarId_),String(setUserActiveCalendarId_),String(runSetupMenuStep_)].join('\n');
  ['Session.getActiveUser','Session.getEffectiveUser','Session.getTemporaryActiveUserKey','PropertiesService.getUserProperties'].forEach(function(token){assertFalse_(sources.indexOf(token)!==-1,'Identidade/cadastro não pode usar mecanismo Google: '+token+'.');});
  assertTrue_(String(getRequestIdentity_).indexOf('UNAUTHENTICATED')!==-1,'Sem token próprio a identidade deve permanecer vazia.');
  assertTrue_(String(authenticatedRpc).indexOf("if(!supplied)throw new Error('AUTH_REQUIRED")!==-1,'Toda RPC interativa deve exigir token próprio.');
}

/** R30 — e-mail cadastrado recebe perfil da base; público só existe por parâmetro explícito e vê publicação. */
function testR30PublicEmailAccessContract_() {
  const resolve=String(resolveAuthPrincipalByEmail_),access=String(getAccessContext_),projects=String(listProjects_),open=String(openProjectWorkspace),seed=String(seedSystem_);
  assertTrue_(resolve.indexOf('getActiveAuthUserByEmail_')!==-1&&resolve.indexOf('isPublicAccessEnabled_')!==-1,'Resolução deve priorizar USERS e depois a política pública.');
  assertTrue_(access.indexOf("principalKind === 'REGISTERED'")!==-1&&access.indexOf("principalKind === 'PUBLIC'")!==-1,'Contexto deve distinguir usuário cadastrado de visitante Público.');
  assertTrue_(projects.indexOf("status||'').trim().toUpperCase()==='PUBLICADO'")!==-1,'Público deve listar somente Projetos com versão publicada.');
  assertTrue_(open.indexOf('access.isPublic')!==-1&&open.indexOf("==='PUBLICADO'")!==-1,'Abertura pública deve selecionar somente versão PUBLICADA.');
  assertTrue_(seed.indexOf('public_access_enabled')!==-1&&seed.indexOf("'false'")!==-1,'Acesso público deve nascer desabilitado e ser opt-in na base.');
}

/** R30 — confirmação de código carrega a aplicação no mesmo iframe, sem redirect para script.google.com. */
function testR30SameFrameLoginContract_() {
  const auth=HtmlService.createHtmlOutputFromFile('auth').getContent(),confirm=String(confirmAccessCode),resume=String(getAuthenticatedApplicationHtml);
  assertTrue_(confirm.indexOf('applicationHtml=createApplicationHtml_')!==-1,'Confirmação deve devolver a aplicação autenticada na mesma RPC.');
  assertTrue_(resume.indexOf('validateAuthAccessToken_')!==-1&&resume.indexOf('createApplicationHtml_')!==-1,'Restauração deve revalidar token e devolver HTML autenticado.');
  ['document.open()','document.write(content)','document.close()','CALENDAR_ACADEMIC_ACCESS_TOKEN_V2'].forEach(function(text){assertTrue_(auth.indexOf(text)!==-1,'Transição same-frame ausente: '+text+'.');});
  ['window.location.replace','window.open','script.google.com','access_token'].forEach(function(text){assertFalse_(auth.indexOf(text)!==-1,'Login não pode depender de navegação externa/query token: '+text+'.');});
}

/** R30 — tokens antigos não podem sobreviver ao corte para a identidade exclusivamente por e-mail. */
function testR30TokenCutoverContract_() {
  const config=String(CAL_AUTH_CONFIG.TOKEN_VERSION),envelope=String(validateAuthAccessTokenEnvelope_),logout=String(endEmailAccessSession);
  assertTrue_(Number(CAL_AUTH_CONFIG.TOKEN_VERSION)===2,'R30 deve invalidar explicitamente os tokens da implementação anterior.');
  assertTrue_(envelope.indexOf('CAL_AUTH_CONFIG.TOKEN_VERSION')!==-1,'Validação criptográfica deve conferir a versão do token.');
  assertTrue_(logout.indexOf('REVOKED_TOKEN_PREFIX')!==-1,'Sair deve revogar o token próprio sem depender de sessão Google.');
}

/** R30 — a autoridade da base é revalidada entre solicitação, confirmação e RPC negocial. */
function testR30ChallengeRevalidationContract_() {
  const confirm=String(confirmAccessCode),validate=String(validateAuthAccessToken_);
  assertTrue_(confirm.indexOf('resolveAuthPrincipalByEmail_(email)')!==-1&&confirm.indexOf('principal.kind!==String(challenge.principalKind')!==-1,'Confirmação deve revalidar o principal na base antes de emitir a sessão.');
  assertTrue_(validate.indexOf('resolveAuthPrincipalByEmail_(identity.email)')!==-1&&validate.indexOf('principal.kind!==identity.principalKind')!==-1,'Cada RPC negocial deve refletir inativação do usuário ou desligamento do acesso público.');
}

/** R30 — CRUD/migração de usuários não pode inferir conta do navegador como ator ou cadastro. */
function testR30UserCrudIdentityIsolationContract_() {
  const sources=[String(saveSystemUser),String(getUsersAdminData),String(migrateUsersAndProjectMembers_),String(runSetupMenuStep_),String(sendSystemHtmlEmail_)].join('\n');
  ['Session.getActiveUser','Session.getEffectiveUser','Session.getTemporaryActiveUserKey','getUserProperties'].forEach(function(token){assertFalse_(sources.indexOf(token)!==-1,'CRUD/cadastro não pode inferir identidade Google: '+token+'.');});
  assertTrue_(String(sendSystemHtmlEmail_).indexOf('MailApp.sendEmail')!==-1,'Entrega do núcleo deve usar MailApp sem determinar a identidade da aplicação.');
}

/** R31 — recusa jamais aplica mutação e toda exclusão aceita exige confirmação destrutiva explícita. */
function testR31CollaborationDecisionAndRemovalSafetyContract_() {
  assertFalse_(collaborationDecisionAppliesDraftMutation_('REJECT',COLLABORATION_KIND.DRAFT_EVENT),'Recusar sugestão de rascunho não pode tocar EVENTS.');
  assertTrue_(collaborationDecisionAppliesDraftMutation_('ACCEPT',COLLABORATION_KIND.DRAFT_EVENT),'Aceitar sugestão de rascunho deve permitir a mutação prevista.');
  assertFalse_(collaborationDecisionAppliesDraftMutation_('ACCEPT',COLLABORATION_KIND.RECTIFICATION),'Pedido ligado à publicação não pode alterar diretamente a versão imutável.');
  const server=String(reviewCollaborationSuggestion),incorporate=String(incorporateRectificationSuggestion),html=HtmlService.createHtmlOutputFromFile('index').getContent();
  assertTrue_(server.indexOf('DECISION_MISMATCH')!==-1&&server.indexOf('clientDecision')!==-1,'Servidor deve rejeitar divergência entre a decisão da interface e a RPC.');
  assertTrue_(server.indexOf('REMOVE_CONFIRMATION_REQUIRED')!==-1&&server.indexOf('payload.confirmRemove!==true')!==-1,'Aceite de REMOVE deve exigir confirmação explícita no backend.');
  assertTrue_(incorporate.indexOf('REMOVE_CONFIRMATION_REQUIRED')!==-1,'Incorporação de retificação REMOVE deve manter a mesma proteção destrutiva.');
  assertTrue_(html.indexOf("item.action==='REMOVE'&&options.confirmRemove!==true")!==-1&&html.indexOf("reviewSelectedCollaboration('ACCEPT',{confirmRemove:true})")!==-1,'Interface deve confirmar a exclusão identificando a sugestão antes de enviar ACCEPT.');
  assertTrue_(server.indexOf('requestedDecision:normalizedDecision')!==-1&&server.indexOf("appVersion:String(APP_VERSION||'')")!==-1,'Auditoria deve registrar decisão, ação e versão executada.');
}

/** R31 — novos parâmetros de Tema têm default seguro e round-trip canônico. */
function testR31ThemeWeekendAndCellEventDisplayContract_() {
  ['weekend_color','calendar_event_display'].forEach(function(column){assertTrue_(DB_SCHEMA.THEMES.indexOf(column)!==-1,'THEMES deve persistir '+column+'.');});
  const legacy=themeRowToClient_({page_bg:'#f4f7f4',surface_bg:'#ffffff',text_color:'#17351f',muted_color:'#5d6d61',accent_color:'#287a3f'});
  assertEquals_('',legacy.weekendColor,'Tema legado deve herdar o Fundo sem inventar cor personalizada.');
  assertEquals_('DOTS',legacy.calendarEventDisplay,'Tema legado deve mostrar pontos coloridos por padrão.');
  const theme=Object.assign({},DEFAULT_THEMES[0],{weekendColor:'#abcdef',calendarEventDisplay:'NAMES',active:true,version:3});
  const row=themeClientToRow_(theme),roundTrip=themeRowToClient_(row);
  assertEquals_('#abcdef',row.weekend_color,'Cor opcional deve ser serializada em THEMES.');
  assertEquals_('NAMES',row.calendar_event_display,'Modo de célula deve ser serializado em THEMES.');
  assertEquals_('#abcdef',roundTrip.weekendColor,'Round-trip deve preservar a cor de fim de semana.');
  assertEquals_('NAMES',roundTrip.calendarEventDisplay,'Round-trip deve preservar o modo de exibição.');
  assertFalse_(validateThemePayload_(Object.assign({},theme,{weekendColor:'azul'})).ok,'Cor opcional inválida deve ser rejeitada.');
  assertFalse_(validateThemePayload_(Object.assign({},theme,{calendarEventDisplay:'ICONS'})).ok,'Modo de célula desconhecido deve ser rejeitado.');
}

/** R31 — Mesa, Prévia e PDF consomem os mesmos parâmetros do Tema. */
function testR31ThemeSurfaceParityContract_() {
  const base=Object.assign({},DEFAULT_THEMES[0],{weekendColor:'#abcdef'});
  const event={id:'EV-R31',eventTypeId:'TYPE-R31',title:'Evento R31',startDate:'2026-03-03',endDate:'2026-03-03'};
  const school={dates:[],byMonth:{}},holidayData={holidays:[],occurrences:[]},typeMap={'TYPE-R31':{visualRole:'PRINCIPAL'}};
  function tableFor_(mode){const html=buildPreviewMonth_(2026,3,[event],school,holidayData,[],Object.assign({},base,{calendarEventDisplay:mode}),typeMap);return html.slice(html.indexOf('<table'),html.indexOf('</table>')+8);}
  assertTrue_(tableFor_('NAMES').indexOf('preview-day-event label')!==-1,'Modo NAMES deve escrever o nome dentro da célula da Prévia/PDF.');
  assertTrue_(tableFor_('DOTS').indexOf('preview-day-event dot')!==-1,'Modo DOTS deve escrever apenas marcadores coloridos na célula da Prévia/PDF.');
  assertFalse_(tableFor_('NONE').indexOf('preview-day-events')!==-1,'Modo NONE não pode renderizar conteúdo de evento na célula da Prévia/PDF.');
  const css=previewThemeContractCss_(base);
  assertTrue_(css.indexOf('#abcdef!important')!==-1&&css.indexOf('th.weekend')!==-1&&css.indexOf('td.weekend')!==-1,'Prévia e PDF devem aplicar a cor de fim de semana a cabeçalho e células.');
  const html=HtmlService.createHtmlOutputFromFile('index').getContent();
  ['themeCustomWeekendColor','themeWeekendColor','themeCalendarEventDisplay'].forEach(function(id){assertTrue_(html.indexOf('id="'+id+'"')!==-1,'Editor de Tema deve expor '+id+'.');});
  assertTrue_(html.indexOf("root.style.setProperty('--calendar-weekend-bg', theme.weekendColor || pageBg)")!==-1,'Mesa deve herdar a mesma cor de fim de semana, com fallback para Fundo.');
  assertTrue_(html.indexOf('calendarThemeDayClasses_')!==-1&&html.indexOf('calendarThemeEventDisplayClient_')!==-1,'FullCalendar deve aplicar os dois parâmetros por hooks públicos.');
  assertTrue_(html.indexOf("viewType.indexOf('list')!==-1?'NAMES'")!==-1,'Visões em lista devem conservar os nomes, pois o parâmetro atua somente nas células dos dias.');
  assertTrue_(String(buildLivePreviewHtml_).indexOf('previewThemeContractCss_(theme)')!==-1,'Prévia e PDF devem compartilhar o mesmo compositor temático.');
}

/** R31 — Tema aceita zero ou mais cores específicas e a mesma precedência vale nas três superfícies. */
function testR31UnlimitedEventTypeColorsContract_() {
  assertTrue_(DB_SCHEMA.THEMES.indexOf('event_type_colors_json')!==-1,'THEMES deve persistir associações ilimitadas em JSON.');
  const legacy=themeRowToClient_({page_bg:'#f4f7f4',surface_bg:'#ffffff',text_color:'#17351f',muted_color:'#5d6d61',accent_color:'#287a3f'});
  assertEquals_(0,legacy.eventTypeColors.length,'Tema legado deve migrar com zero associações, preservando o fallback visual.');
  const many=Array.from({length:20},function(_,index){return {eventTypeId:'TYPE-'+(index+1),color:'#'+(0x110000+index).toString(16).padStart(6,'0')};});
  const theme=Object.assign({},DEFAULT_THEMES[0],{name:'Tema ilimitado',eventTypeColors:many,active:true,version:2});
  const validation=validateThemePayload_(theme);
  assertTrue_(validation.ok,'Vinte associações válidas devem ser aceitas sem limite artificial.');
  const row=themeClientToRow_(validation.theme),roundTrip=themeRowToClient_(row);
  assertEquals_(20,roundTrip.eventTypeColors.length,'Round-trip deve preservar todas as associações.');
  assertEquals_(many[19].color,roundTrip.eventTypeColors[19].color,'A última associação deve manter a cor exata escolhida.');
  assertEquals_(many[6].color,themeColorForEventType_(roundTrip,'TYPE-7','ATENCAO'),'Cor específica deve prevalecer sobre a paleta da função visual.');
  assertEquals_(roundTrip.eventColors[3],themeColorForEventType_(roundTrip,'TYPE-SEM-COR','ATENCAO'),'Tipo sem associação deve herdar a função visual existente.');
  assertFalse_(validateThemePayload_(Object.assign({},theme,{eventTypeColors:[many[0],many[0]]})).ok,'O mesmo tipo não pode receber duas associações conflitantes.');
  assertFalse_(validateThemePayload_(Object.assign({},theme,{eventTypeColors:[{eventTypeId:'TYPE-X',color:'azul'}]})).ok,'Cor específica inválida deve ser rejeitada.');
  const event={id:'EV-COLOR',eventTypeId:'TYPE-7',title:'Evento específico',startDate:'2026-03-03',endDate:'2026-03-03'};
  const preview=buildPreviewMonth_(2026,3,[event],{dates:[],byMonth:{}},{holidays:[],occurrences:[]},[],Object.assign({},roundTrip,{calendarEventDisplay:'DOTS'}),{'TYPE-7':{visualRole:'ATENCAO'}});
  assertTrue_(preview.indexOf(many[6].color)!==-1,'Prévia/PDF devem materializar a cor específica do tipo no calendário e na lista mensal.');
  const html=HtmlService.createHtmlOutputFromFile('index').getContent();
  ['themeEventTypeColorsList','addThemeEventTypeColorBtn'].forEach(function(id){assertTrue_(html.indexOf('id="'+id+'"')!==-1,'Editor deve expor o controle dinâmico '+id+'.');});
  ['themeColorForEventTypeClient','themeEventTypeColorsFromForm_','renderThemeEventTypeColors_'].forEach(function(token){assertTrue_(html.indexOf(token)!==-1,'Mesa/editor devem compartilhar o contrato '+token+'.');});
  assertTrue_(html.indexOf("styleMountedEventChip(chip, state.activeTheme, role,calendarThemeEventDisplayClient_(info),eventTypeId)")!==-1,'FullCalendar deve passar o tipo até o resolvedor cromático do Tema.');
  assertTrue_(html.indexOf('themeColorForEventTypeClient(state.activeTheme,el.eventTypeId.value,role)')!==-1,'A amostra do cadastro de Tipo também deve refletir eventual associação específica do Tema ativo.');
  assertTrue_(html.indexOf('escapeHtmlClient(sampleNames[eventIndex])')!==-1,'A prévia do editor deve escapar nomes de Tipos de Evento antes de inseri-los no HTML.');
}

/** R32 — a posse de edição é persistida por Projeto e vinculada à sessão e à aba autenticadas. */
function testR32ProjectEditLeaseSchemaAndOwnershipContract_() {
  ['project_id','holder_user_id','holder_email','holder_name','client_instance_id','session_key_hash','acquired_at','renewed_at','expires_at','released_at','release_reason','updated_at','version'].forEach(function(column){assertTrue_(DB_SCHEMA.PROJECT_EDIT_LEASES.indexOf(column)!==-1,'PROJECT_EDIT_LEASES deve persistir '+column+'.');});
  const access=String(getProjectAccessContext_),ownership=String(projectEditLeaseRowState_),auth=String(authenticatedRpc);
  assertTrue_(access.indexOf('editorEligible')!==-1&&access.indexOf('editLease.isMine')!==-1,'Papel de Editor e posse efetiva precisam ser decisões distintas.');
  assertTrue_(ownership.indexOf('client_instance_id')!==-1&&ownership.indexOf('session_key_hash')!==-1,'Posse deve exigir a mesma aba e a mesma sessão própria por e-mail.');
  assertTrue_(auth.indexOf('identity.clientInstanceId=normalizeClientInstanceId_')!==-1,'Cada RPC autenticada deve carregar a identidade da aba validada.');
  assertTrue_(String(endEmailAccessSession).indexOf("releaseProjectEditLeasesForSession_('LOGOUT')")!==-1,'Logout deve liberar a edição pertencente à sessão e à aba.');
}

/** R32 — aquisição/renovação/expiração e retomada são serializadas e auditáveis. */
function testR32ProjectEditLeaseConcurrencyContract_() {
  const acquire=String(acquireProjectEditLeaseInternal_),release=String(releaseProjectEditLeaseInternal_),heartbeat=String(heartbeatProjectCollaboration),force=String(forceAcquireProjectEditLease);
  assertTrue_(acquire.indexOf('LockService.getScriptLock()')!==-1&&acquire.indexOf('state.active&&!state.isMine&&!force')!==-1,'Dois Editores não podem adquirir simultaneamente a mesma edição.');
  assertTrue_(acquire.indexOf('PROJECT_EDIT_LEASE_FORCED')!==-1&&acquire.indexOf('justification')!==-1,'Retomada administrativa deve registrar justificativa e auditoria.');
  assertTrue_(release.indexOf('NOT_LEASE_OWNER')!==-1&&release.indexOf('released_at')!==-1,'Uma aba não pode liberar a posse de outra.');
  assertTrue_(heartbeat.indexOf('requestEditLease!==false')!==-1&&heartbeat.indexOf('touchProjectPresence_')!==-1,'Heartbeat deve renovar presença e respeitar liberação voluntária.');
  assertTrue_(force.indexOf('acquireProjectEditLeaseInternal_(projectId,true,justification)')!==-1,'Retomada deve usar a mesma seção crítica da aquisição normal.');
  assertTrue_(PROJECT_PRESENCE_HEARTBEAT_SECONDS<PROJECT_EDIT_LEASE_SECONDS,'Heartbeat precisa ocorrer antes da expiração da posse.');
}

/** R32 — toda mutação do calendário respeita a posse, preservando sugestões como saída colaborativa. */
function testR32MutationAndSuggestionFallbackContract_() {
  const guard=String(calendarVersionMutationFailure_),editor=String(requireProjectEditor_),submit=String(submitCollaborationSuggestion);
  assertTrue_(guard.indexOf('projectEditLeaseFailure_')!==-1,'Guarda central das mutações deve bloquear Editor sem posse.');
  assertTrue_(editor.indexOf('EDIT_LEASE_HELD')!==-1&&editor.indexOf('Envie uma sugestão')!==-1,'Operações editoriais fora da guarda central devem orientar o fluxo de sugestão.');
  assertTrue_(submit.indexOf('getProjectAccessContext_')!==-1&&submit.indexOf('access.canSuggest')!==-1&&submit.indexOf('requireProjectEditor_')===-1,'Enviar sugestão deve continuar permitido a qualquer participante do Projeto.');
  assertTrue_(String(reviewCollaborationSuggestion).indexOf('requireProjectEditor_')!==-1,'Aceitar ou recusar sugestões deve exigir o Editor que detém a edição.');
}

/** R32 — a Mesa torna presença e bloqueio visíveis sem expor e-mails ou depender da conta Google. */
function testR32PresenceAndLeaseUiContract_() {
  const html=HtmlService.createHtmlOutputFromFile('index').getContent();
  ['presenceWrap','presenceBtn','presencePopover','presenceLeaseText','presenceList','presenceSuggestBtn','acquireEditLeaseBtn','releaseEditLeaseBtn','forceEditLeaseBtn','forceEditLeaseReason'].forEach(function(id){assertTrue_(html.indexOf('id="'+id+'"')!==-1,'Indicador de presença deve expor '+id+'.');});
  assertTrue_(html.indexOf('sessionStorage.getItem(CAL_CLIENT_INSTANCE_STORAGE_KEY)')!==-1&&html.indexOf('authenticatedRpc(String(property),args,calAccessToken,calClientInstanceId)')!==-1,'A aba deve manter e enviar sua identidade própria em todas as RPCs.');
  assertTrue_(html.indexOf('heartbeatProjectCollaboration(projectId,!state.editLeaseOptOut)')!==-1,'Renovação deve respeitar a liberação voluntária do usuário.');
  assertTrue_(html.indexOf('.openProjectWorkspace(projectId,token,previousProjectId)')!==-1,'Troca de Projeto deve informar o anterior para liberar sua edição.');
  assertTrue_(html.indexOf("openCollaborationDrawer('CREATE')")!==-1&&html.indexOf('access.canSuggest&&!access.canEdit')!==-1,'Editor bloqueado deve receber ação direta para enviar sugestão.');
  assertTrue_(html.indexOf('person.email')===-1,'Lista visual de presença não deve depender de e-mails retornados ao navegador.');
}

/** R33: o mesmo módulo textual deve ser entregue no acesso e na Mesa autenticada. */
function testR33HelpInjectionContract_() {
  const code=String(injectHelpModule_),auth=String(createAuthenticationHtml_),app=String(createApplicationHtml_);
  assertTrue_(code.indexOf("createHtmlOutputFromFile('help-content')")!==-1&&code.indexOf("createHtmlOutputFromFile('help-assistant')")!==-1,'Injeção deve carregar conteúdo e componente da Ajuda.');
  assertTrue_(auth.indexOf('injectHelpModule_')!==-1&&app.indexOf('injectHelpModule_')!==-1,'Acesso e Mesa devem receber o mesmo módulo de Ajuda.');
  assertTrue_(/^0\.0\.5-beta(?:1[0-9]|[2-9][0-9]+)-pv29$/.test(String(APP_VERSION)),'R33+ deve permanecer na linha beta10 ou posterior de PV29.');
}

/** R33: o catálogo aprovado permanece completo e possui fallback explícito. */
function testR33HelpCatalogContract_() {
  const html=HtmlService.createHtmlOutputFromFile('help-content').getContent();
  const topicIds=html.match(/"id":\s*"[A-Z]{3}-\d{2}"/g)||[];
  const alertIds=html.match(/"id":\s*"ALT-[A-Z]{3}-\d{2}"/g)||[];
  assertEquals_(75,topicIds.length,'Catálogo deve conter os 75 tópicos aprovados.');
  assertEquals_(63,alertIds.length,'Catálogo deve conter as 63 explicações de alerta aprovadas.');
  assertTrue_(html.indexOf('"fallbackAlertId": "SUP-AGE-01"')!==-1,'Catálogo deve conservar o fallback técnico agrupado.');
  ['AUTH_REQUIRED','EDIT_LEASE_HELD','REJECT_WITH_MUTATION_GUARD','LOW_CONTRAST'].forEach(function(code){assertTrue_(html.indexOf('"'+code+'"')!==-1,'Explicação obrigatória ausente: '+code+'.');});
}

/** R33: painel é acionado pelo usuário, acessível e discreto. */
function testR33HelpPanelAccessibilityContract_() {
  const html=HtmlService.createHtmlOutputFromFile('help-assistant').getContent();
  ['calHelpButton','calHelpPanel','calHelpTitle','calHelpContent','aria-modal','aria-hidden'].forEach(function(marker){assertTrue_(html.indexOf(marker)!==-1,'Contrato visual/acessível da Ajuda ausente: '+marker+'.');});
  assertTrue_(html.indexOf("event.key==='Escape'")!==-1&&html.indexOf('returnFocus')!==-1,'Painel deve fechar por Escape e devolver o foco.');
  assertTrue_(html.indexOf('prefers-reduced-motion:reduce')!==-1,'Animação discreta deve respeitar movimento reduzido.');
  assertTrue_(html.indexOf('cal-help-entry-context')!==-1&&html.indexOf('MutationObserver')!==-1,'Ajuda deve permanecer acessível sobre janelas internas.');
  assertTrue_(html.indexOf("openPanel();")===-1,'Ajuda não pode abrir automaticamente.');
  assertTrue_(html.indexOf('MAX_HISTORY=10')!==-1&&html.indexOf('sessionStorage')!==-1,'Histórico deve permanecer limitado à sessão atual.');
}

/** R33: somente erro e aviso corretivo ativam a Ajuda; códigos não dependem do texto exibido. */
function testR33HelpAlertBridgeContract_() {
  const assistant=HtmlService.createHtmlOutputFromFile('help-assistant').getContent();
  const auth=HtmlService.createHtmlOutputFromFile('auth').getContent();
  const app=HtmlService.createHtmlOutputFromFile('index').getContent();
  const access=String(requestAccessCode)+String(confirmAccessCode)+String(consumeAuthRateLimit_);
  assertTrue_(assistant.indexOf("severity!=='error'&&severity!=='warning'")!==-1,'Sucesso, informação e processamento não podem ativar a Ajuda.');
  assertTrue_(assistant.indexOf("replace(/^\\s*[A-Z][A-Z0-9_]+:\\s*/,'')")!==-1,'Mensagem guardada deve remover o prefixo técnico.');
  ['AUTH_EMAIL_INVALID','AUTH_CODE_RATE_LIMITED','AUTH_CODE_SEND_FAILED','AUTH_CODE_INVALID_OR_EXPIRED','AUTH_ACCESS_CHANGED'].forEach(function(code){assertTrue_(access.indexOf(code)!==-1,'Código estável de autenticação ausente: '+code+'.');});
  assertTrue_(auth.indexOf('CalHelp.captureFeedback')!==-1&&app.indexOf('CalHelp.captureFeedback')!==-1,'Acesso e Mesa devem encaminhar alertas ao painel.');
  assertTrue_(app.indexOf("code==='AUTH_REQUIRED'")!==-1&&app.indexOf('CalHelp.captureAlert')!==-1,'Expiração deve ser guardada antes da recarga.');
}


/** R34: a Ajuda deve entrar no </body> real, sem corromper strings JavaScript da Prévia. */
function testR34AuthenticatedHtmlInjectionRegression_() {
  const source=HtmlService.createHtmlOutputFromFile('index').getContent();
  const lower=source.toLowerCase();
  const embeddedClose=lower.indexOf('</body>');
  const documentClose=lower.lastIndexOf('</body>');
  assertTrue_(embeddedClose>=0&&documentClose>embeddedClose,'Fixture real deve conservar </body> interno na string da Prévia e fechamento final do documento.');

  const injected=injectHelpModule_(source);
  const helpMarker=injected.indexOf('calHelpButton');
  assertTrue_(helpMarker>documentClose,'Módulo de Ajuda deve ser inserido somente antes do fechamento final do documento.');
  assertEquals_(source.slice(0,embeddedClose+7),injected.slice(0,embeddedClose+7),'Injeção não pode alterar o </body> embutido no JavaScript da Prévia.');
  assertTrue_(String(injectHelpModule_).indexOf('injectBeforeFinalBodyClose_')!==-1&&String(injectBeforeFinalBodyClose_).indexOf('lastIndexOf')!==-1,'Injeção deve buscar explicitamente o último fechamento de body.');

  const assembled=createApplicationHtml_('R34_REGRESSION_TOKEN').getContent();
  assertTrue_(assembled.indexOf("const CAL_SERVER_BOOTSTRAP_ACCESS_TOKEN = 'R34_REGRESSION_TOKEN';")!==-1,'Mesa autenticada deve aceitar o token e materializar HtmlOutput válido.');
  assertTrue_(assembled.indexOf('calHelpButton')!==-1,'Mesa autenticada deve continuar contendo o módulo de Ajuda após a correção.');
  assertTrue_(String(APP_VERSION).indexOf('0.0.5-beta')===0,'A correção R34 deve permanecer ativa nas releases beta posteriores.');
}


/** R35: a planilha matriz nunca pode executar a instalação; somente uma cópia com ID diferente. */
function testR35InstallerCopyGuardContract_() {
  const guard=String(assertInstallerIsCopy_),prepare=String(prepareOfficialInstallerTemplate),wizard=HtmlService.createHtmlOutputFromFile('installer-ui').getContent();
  assertTrue_(guard.indexOf('getInstallerTemplateId_')!==-1&&guard.indexOf('spreadsheet.getId()')!==-1,'Trava deve comparar o ID atual com o ID persistido da matriz.');
  assertTrue_(guard.indexOf('INSTALLER_TEMPLATE_FORBIDDEN')!==-1,'Tentativa de instalação na matriz deve possuir erro estável e explícito.');
  assertTrue_(prepare.indexOf('CAL_INSTALLER_TEMPLATE_ID')!==-1||prepare.indexOf('INSTALLER_TEMPLATE_ID_RANGE')!==-1,'Preparação da matriz deve persistir sua identidade na própria planilha para sobreviver à cópia.');
  assertTrue_(prepare.indexOf("assignScript('iniciarInstalacao')")!==-1||String(installerUpsertActionImage_).indexOf('assignScript')!==-1,'Botão principal deve chamar apenas o entrypoint público do instalador.');
  assertTrue_(wizard.indexOf('if(state.isTemplate)')!==-1&&wizard.indexOf('Faça uma cópia para instalar')!==-1,'O assistente deve distinguir a matriz e orientar a instalação em uma cópia.');
}

function installerFunctionWithBindings_(fn,bindings) {
  const names=Object.keys(bindings);
  return Function.apply(null,names.concat('return ('+String(fn)+');')).apply(null,names.map(function(name){return bindings[name];}));
}

/** A troca da tela de acesso pela Mesa mantém marca, token e título do calendário independentes. */
function testFolhinhaIdentityHandoff_() {
  const access=createAuthenticationHtml_().getContent();
  const workspace=createApplicationHtml_('FOLHINHA_TEST_TOKEN').getContent();
  [access,workspace].forEach(function(html){
    assertFalse_(html.indexOf('__FOLHINHA_BRAND_')!==-1,'Assinatura deve estar materializada na tela.');
    assertEquals_(1,(html.match(/id="folhinha-horizontal"/g)||[]).length,'Cada documento deve conter uma única definição de cada assinatura.');
    assertTrue_(html.indexOf('calHelpButton')!==-1,'Ajuda deve continuar disponível.');
  });
  assertTrue_(access.indexOf('Seu ano toma forma.')!==-1,'Acesso deve apresentar o slogan oficial.');
  assertTrue_(workspace.indexOf("const CAL_SERVER_BOOTSTRAP_ACCESS_TOKEN = 'FOLHINHA_TEST_TOKEN';")!==-1,'Marca não pode interferir no token de entrada.');
  ['calendarName','calendarTitleEditor','calendarTitleInput','saveCalendarTitleBtn','cancelCalendarTitleBtn','projectVersionBadge'].forEach(function(id){
    assertTrue_(workspace.indexOf('id="'+id+'"')!==-1,'Título editável e versão devem ser preservados: '+id+'.');
  });
}

/** Reaplicar a marca na instaladora só toca os espaços visuais do produto. */
function testFolhinhaInstallerIdentityIsolation_() {
  const writes=[],removed=[];
  const previous={getAltTextTitle:function(){return 'FOLHINHA_INSTALLER_PRODUCT';},remove:function(){removed.push('product');}};
  const institutional={getAltTextTitle:function(){return 'CAL_INSTALLER_BRAND';},remove:function(){removed.push('institution');}};
  const manual={getAltTextTitle:function(){return 'Botão manual';},remove:function(){removed.push('manual');}};
  const image={setWidth:function(){return image;},setHeight:function(){return image;},setAltTextTitle:function(){return image;},setAltTextDescription:function(){return image;}};
  const range={setValue:function(){return range;},setBackground:function(){return range;},setFontColor:function(){return range;}};
  const update=installerFunctionWithBindings_(installerApplyFolhinhaIdentity_,{
    installerRangePixelSize_:function(){return {width:428,height:111,row:1,column:5};},
    FOLHINHA_INSTALLER_LOGO_PNG_BASE64:'TEST',FOLHINHA_IDENTITY:FOLHINHA_IDENTITY,
    Utilities:{base64Decode:function(value){return value;},newBlob:function(value){return value;}}
  });
  update({getImages:function(){return [previous,institutional,manual];},insertImage:function(){return image;},getRange:function(a1){writes.push(a1);return range;}});
  assertEquals_('product',removed.join(','),'Somente a assinatura gerenciada do Folhinha pode ser substituída.');
  assertEquals_('E1:H3,E4:H5,A6:H6',writes.join(','),'Atualização visual não pode tocar botões, tabelas ou identificadores da instalação.');
}

function testInstallerMenuOrder_() {
  Object.keys(INSTALLATION_STATE).forEach(function(key){
    const entries=[],menu={addItem:function(label,handler){entries.push({label:label,handler:handler});return menu;},addSeparator:function(){return menu;},addToUi:function(){menu.added=true;}};
    const ui={createMenu:function(name){menu.name=name;return menu;}};
    const create=installerFunctionWithBindings_(createCalendarMenu_,{
      SpreadsheetApp:{getActiveSpreadsheet:function(){return {};},getUi:function(){return ui;}},
      getInstallationState_:function(){return INSTALLATION_STATE[key];},INSTALLATION_STATE:INSTALLATION_STATE
    });
    assertTrue_(create(),'Menu deve ser criado no estado '+key+'.');
    assertEquals_('Folhinha',menu.name,'O menu deve exibir o nome do produto.');
    assertEquals_('Preparar planilha instaladora',entries[0].label,'Preparação deve ser a primeira opção.');
    assertEquals_('prepararPlanilhaInstaladora',entries[0].handler,'Preparação deve usar o comando com orientação ao usuário.');
    assertEquals_('Instalar sistema',entries[1].label,'Instalação deve ser a segunda opção.');
    assertEquals_('iniciarInstalacao',entries[1].handler,'Instalação deve manter o assistente protegido.');
    assertEquals_(key==='READY'?3:2,entries.length,'Abertura deve continuar disponível somente após a instalação.');
    if(key==='READY')assertEquals_('abrirSistemaInstalado',entries[2].handler,'Abertura existente deve ser preservada.');
    assertTrue_(menu.added,'Menu deve ser publicado na interface.');
  });
}

function testInstallerPreparationSafety_() {
  let state=INSTALLATION_STATE.NOT_INSTALLED,managed=false,available=true,released=0;
  const changes=[],values={},properties={},ranges={};
  const sheet={getSheetId:function(){return 1;},getRange:function(a1){return {setValue:function(value){changes.push('value');values[a1]=value;}};},hideRows:function(){changes.push('hide');}};
  const ss={getId:function(){return 'MATRIX';},getSheetByName:function(){return managed?{}:null;},getSheets:function(){return [sheet];},setNamedRange:function(name,range){changes.push('range');ranges[name]=range;},rename:function(name){changes.push('rename');ss.name=name;}};
  const prepare=installerFunctionWithBindings_(prepareOfficialInstallerTemplate,{
    SpreadsheetApp:{getActiveSpreadsheet:function(){return ss;}},
    LockService:{getScriptLock:function(){return {tryLock:function(){return available;},releaseLock:function(){released++;}};}},
    getInstallationState_:function(){return state;},INSTALLATION_STATE:INSTALLATION_STATE,DB_SCHEMA:{_SYSTEM:[]},
    installerSheetIsBlank_:function(){return true;},getInstallerSheet_:function(){changes.push('sheet');return sheet;},
    ensureInstallerSpreadsheetTimeZone_:function(){changes.push('timezone');},INSTALLER_TIMEZONE:INSTALLER_TIMEZONE,
    formatInstallerLandingSheet_:function(){changes.push('format');},refreshInstallerLandingSheet_:function(){changes.push('refresh');},
    INSTALLER_DISTRIBUTION_ID:INSTALLER_DISTRIBUTION_ID,INSTALLER_TEMPLATE_ID_RANGE:INSTALLER_TEMPLATE_ID_RANGE,
    INSTALLER_DISTRIBUTION_RANGE:INSTALLER_DISTRIBUTION_RANGE,INSTALLER_STATE_PROPERTY:INSTALLER_STATE_PROPERTY,
    PropertiesService:{getScriptProperties:function(){return {setProperty:function(key,value){changes.push('property');properties[key]=value;}};}}
  });
  [INSTALLATION_STATE.READY,INSTALLATION_STATE.INSTALLING].forEach(function(value){
    state=value;let message='';try{prepare();}catch(error){message=error.message;}
    assertTrue_(message.indexOf('instalação ativa ou em andamento')!==-1,'Estado '+value+' deve impedir preparação mesmo sem tabelas.');
    assertEquals_(0,changes.length,'Preparação bloqueada não pode alterar a planilha nem propriedades.');
  });
  state=INSTALLATION_STATE.NOT_INSTALLED;managed=true;
  let message='';try{prepare();}catch(error){message=error.message;}
  assertTrue_(message.indexOf('sem as tabelas do sistema')!==-1,'Tabelas existentes devem continuar protegidas mesmo sem estado READY.');
  assertEquals_(0,changes.length,'Tabelas existentes não podem ser modificadas.');
  assertEquals_(3,released,'Toda recusa após adquirir o lock deve liberá-lo.');
  managed=false;available=false;message='';try{prepare();}catch(error){message=error.message;}
  assertTrue_(message.indexOf('em andamento')!==-1,'Operação concorrente deve impedir preparação.');
  assertEquals_(0,changes.length,'Lock indisponível não pode permitir alterações.');
  assertEquals_(3,released,'Lock não adquirido não deve ser liberado.');
  available=true;
  assertTrue_(prepare().ok,'Planilha limpa e sem instalação deve poder ser preparada.');
  assertEquals_('MATRIX',values.G14,'Preparação deve registrar o ID original da matriz.');
  assertEquals_(INSTALLER_DISTRIBUTION_ID,values.H14,'Preparação deve preservar a identificação da distribuição.');
  assertTrue_(!!ranges[INSTALLER_TEMPLATE_ID_RANGE]&&!!ranges[INSTALLER_DISTRIBUTION_RANGE],'Identificadores devem sobreviver à cópia por intervalos nomeados.');
  assertEquals_(INSTALLATION_STATE.NOT_INSTALLED,properties[INSTALLER_STATE_PROPERTY],'Preparar não pode marcar o sistema como instalado.');
  assertEquals_(4,released,'Preparação concluída deve liberar o lock.');
}

function testInstallerCopyInstallationSafety_() {
  let templateId='',currentId='COPY',lockCount=0,state=INSTALLATION_STATE.NOT_INSTALLED;
  const properties={},ss={getId:function(){return currentId;}};
  const spreadsheetApp={getActiveSpreadsheet:function(){return ss;}};
  const guard=installerFunctionWithBindings_(assertInstallerIsCopy_,{
    SpreadsheetApp:spreadsheetApp,getInstallerTemplateId_:function(){return templateId;}
  });
  const begin=installerFunctionWithBindings_(beginInstallerInstallation,{
    SpreadsheetApp:spreadsheetApp,assertInstallerIsCopy_:guard,
    LockService:{getScriptLock:function(){lockCount++;return {tryLock:function(){return true;},releaseLock:function(){}};}},
    getInstallationState_:function(){return state;},INSTALLATION_STATE:INSTALLATION_STATE,installerHasManagedData_:function(){return false;},
    normalizeInstallerConfig_:function(payload){return payload;},Utilities:{getUuid:function(){return 'TEST';}},
    installerReadNamedValue_:function(){return INSTALLER_DISTRIBUTION_ID;},INSTALLER_DISTRIBUTION_RANGE:INSTALLER_DISTRIBUTION_RANGE,
    INSTALLER_DISTRIBUTION_ID:INSTALLER_DISTRIBUTION_ID,INSTALLER_PENDING_PROPERTY:INSTALLER_PENDING_PROPERTY,
    INSTALLER_RUN_PROPERTY:INSTALLER_RUN_PROPERTY,INSTALLER_STATE_PROPERTY:INSTALLER_STATE_PROPERTY,
    PropertiesService:{getScriptProperties:function(){return {setProperty:function(key,value){properties[key]=value;}};}},
    getInstallerInstallationPlan:getInstallerInstallationPlan
  });
  const step=installerFunctionWithBindings_(runInstallerInstallationStep,{SpreadsheetApp:spreadsheetApp,assertInstallerIsCopy_:guard});
  function blocked_(action,code){let message='';try{action();}catch(error){message=error.message;}assertTrue_(message.indexOf(code+':')===0,'Operação deve ser bloqueada com '+code+'.');}
  [['','INSTALLER_TEMPLATE_NOT_PREPARED'],['COPY','INSTALLER_TEMPLATE_FORBIDDEN']].forEach(function(test){
    templateId=test[0];blocked_(function(){begin({});},test[1]);blocked_(function(){step('TEST',1);},test[1]);
    assertEquals_(0,Object.keys(properties).length,'Bloqueio deve ocorrer antes de gravar estado da instalação.');
    assertEquals_(0,lockCount,'Identidade inválida deve ser recusada antes de iniciar a instalação.');
  });
  templateId='MATRIX';
  assertTrue_(guard(ss),'Cópia preparada com ID diferente da matriz deve ser aceita.');
  assertTrue_(begin({superuserEmail:'test@example.org'}).ok,'Somente a cópia preparada deve iniciar a instalação.');
  assertEquals_(INSTALLATION_STATE.INSTALLING,properties[INSTALLER_STATE_PROPERTY],'Cópia válida deve entrar em instalação.');
  const before=JSON.stringify(properties);state=INSTALLATION_STATE.READY;
  blocked_(function(){begin({});},'INSTALLER_ALREADY_READY');
  assertEquals_(before,JSON.stringify(properties),'Instalação ativa não pode ser reinstalada.');
}

/** R35: instalação nasce segura e o núcleo não depende da Gmail API/Google Cloud. */
function testR35InstallerCoreDefaultsContract_() {
  const step=String(runInstallerInstallationStep),mail=String(sendSystemHtmlEmail_),setup=String(ensureSetup_);
  assertTrue_(step.indexOf("upsertSystemValue_(ss,'public_access_enabled','false')")!==-1||step.indexOf("'public_access_enabled','false'")!==-1,'Acesso público deve nascer desabilitado.');
  assertTrue_(step.indexOf('INSTALLER_PUBLIC_AGENDA_KEY')!==-1&&step.indexOf("'false'")!==-1,'Agenda Pública deve nascer desabilitada.');
  assertTrue_(step.indexOf('upsertInstallerSuperuser_')!==-1,'Instalação deve criar explicitamente o Superusuário informado.');
  assertTrue_(step.indexOf('getAuthSecret_')!==-1,'Segredo de autenticação deve ser criado durante a instalação.');
  assertTrue_(mail.indexOf('MailApp.sendEmail')!==-1,'Código de login e notificações do núcleo devem usar o serviço nativo de e-mail.');
  assertFalse_(mail.indexOf('Gmail.Users.Messages.send')!==-1,'Núcleo não pode exigir Gmail Advanced API para autenticação.');
  assertFalse_(setup.indexOf("setup('UPDATE')")!==-1,'Abertura normal nunca deve migrar a base silenciosamente.');
  assertTrue_(setup.indexOf('SYSTEM_UPDATE_REQUIRED')!==-1,'Schema incompatível deve pedir atualização explícita.');
}

/** R36: experiência pública do instalador permanece curta, guiada e sem detalhes técnicos. */
function testR36InstallerUxContract_() {
  const html=HtmlService.createHtmlOutputFromFile('installer-ui').getContent(),installer=String(formatInstallerLandingSheet_)+String(getInstallerInstallationPlan);
  ['institution','unit','municipality','stateCode','superuserName','superuserEmail'].forEach(function(id){assertTrue_(html.indexOf('id="'+id+'"')!==-1,'Campo essencial ausente no Wizard: '+id);});
  assertTrue_(html.indexOf('INSTALAR SISTEMA')!==-1&&html.indexOf('Fazer uma cópia')!==-1,'Wizard deve orientar cópia e instalação em linguagem direta.');
  assertTrue_(html.indexOf('Google Cloud')!==-1&&html.indexOf('opcional')!==-1,'Wizard deve esclarecer que integrações avançadas são opcionais.');
  assertTrue_(String(installerUpsertActionImage_).indexOf('insertImage')!==-1&&String(installerUpsertActionImage_).indexOf('assignScript')!==-1,'Landing deve possuir botão grande executável dentro da planilha.');
  assertEquals_(8,getInstallerInstallationPlan().length,'Jornada visual deve possuir oito passos curtos e previsíveis.');
  assertFalse_(html.indexOf('schema_version')!==-1||html.indexOf('DB_SCHEMA')!==-1,'Usuário não deve receber vocabulário interno de schema durante a instalação.');
  const safeJson=installerJsonForHtml_({institution:'</script><script>alert(1)</script>'});
  assertFalse_(safeJson.indexOf('</script>')!==-1,'Estado inicial do Wizard não pode permitir fechamento de script por dado informado pelo usuário.');
}

/** R37: Agenda Pública é recurso opcional, desligado por padrão e administrável depois. */
function testR37OptionalFeaturesContract_() {
  const enabled=String(isPublicAgendaFeatureEnabled_),setter=String(setPublicAgendaFeatureEnabled),bridge=String(authenticatedRpc),projects=String(projectRowToClient_);
  const html=HtmlService.createHtmlOutputFromFile('index').getContent();
  assertTrue_(enabled.indexOf('INSTALLER_PUBLIC_AGENDA_KEY')!==-1,'Estado da Agenda Pública deve possuir chave própria da instalação.');
  assertTrue_(setter.indexOf('SUPERUSUARIO')!==-1,'Somente Superusuário pode mudar o estado da integração opcional.');
  assertTrue_(bridge.indexOf('PUBLIC_AGENDA_DISABLED')!==-1,'RPCs da Agenda devem ser bloqueadas enquanto o recurso estiver desligado.');
  assertTrue_(projects.indexOf("code:'DISABLED'")!==-1&&projects.indexOf('featureEnabled:false')!==-1,'Projetos devem receber estado explícito de Agenda desabilitada.');
  ['optionalFeaturesToolBtn','optionalFeaturesModal','optionalPublicAgendaToggleBtn'].forEach(function(id){assertTrue_(html.indexOf('id="'+id+'"')!==-1,'Controle pós-instalação ausente: '+id);});
  assertTrue_(html.indexOf('Recursos opcionais')!==-1,'Configuração posterior deve estar agrupada como recurso opcional.');
}

/** R38: instalação só termina após validação, oculta a base e deixa a landing em estado pronto. */
function testR38InstallerCompletionContract_() {
  const step=String(runInstallerInstallationStep),validate=String(validateInstallerCore_),hide=String(hideInstallerManagedSheets_),landing=String(refreshInstallerLandingSheet_);
  assertTrue_(/^0\.0\.5-beta(?:1[5-9]|[2-9][0-9]+)-pv29$/.test(String(APP_VERSION)),'R38+ deve preservar a linha beta15 ou posterior.');
  assertTrue_(['0.0.5-beta9-pv29','0.0.5-beta10-pv29'].indexOf(SCHEMA_VERSION)!==-1,'R38 deve permanecer compatível com schemas posteriores do mesmo produto.');
  assertTrue_(step.indexOf('validateInstallerCore_')!==-1,'Conclusão deve depender de validação estrutural.');
  assertTrue_(step.indexOf("INSTALLER_STATE.READY")!==-1&&step.indexOf("'installed_at'")!==-1,'Estado READY e data de instalação só podem ser gravados ao final.');
  assertTrue_(hide.indexOf('sheet.hideSheet()')!==-1,'Tabelas técnicas devem ser ocultadas após instalação.');
  assertTrue_(landing.indexOf('Sistema instalado')!==-1&&landing.indexOf('ABRIR SISTEMA')!==-1,'Landing final deve trocar instalação por abertura do sistema.');
  assertTrue_(validate.indexOf('USERS')!==-1&&validate.indexOf('SUPERUSUARIO')!==-1,'Validação final deve comprovar a existência de Superusuário ativo.');
}

/** R38: localidade não é fixa e operações legadas de reset recuperam um Superusuário utilizável. */
function testR38InstallerLocalityAndRecoveryContract_() {
  const local=String(seedConfiguredMunicipalHolidayCatalog_),policy=String(shouldSeedUberlandiaHolidays_),reset=String(resetManagedInstallation_),run=String(runSetupMenuStep_);
  assertTrue_(local.indexOf('installerIsUberlandia_')!==-1,'Feriado municipal padrão só deve ser aplicado quando a instalação realmente for Uberlândia/MG.');
  assertTrue_(policy.indexOf('installation_municipality')!==-1||policy.indexOf('installerIsUberlandia_')!==-1,'Setup legado deve respeitar a localidade registrada quando disponível.');
  assertTrue_(reset.indexOf("setUserActiveCalendarId_('')")!==-1,'Reset técnico deve limpar referência de calendário ativo.');
  assertTrue_(run.indexOf('migrateUsersAndProjectMembers_')!==-1,'Fluxo técnico legado deve reconstruir/migrar o Superusuário após reset.');
}

/** R48.9: matriz e cópias mantêm o fuso físico da planilha alinhado à instalação. */
function testR48InstallerTimezoneInvariantContract_() {
  assertEquals_('America/Sao_Paulo',INSTALLER_TIMEZONE,'Instalador deve possuir um único fuso horário canônico.');
  const normalize=String(normalizeInstallerConfig_),prepare=String(prepareOfficialInstallerTemplate),step=String(runInstallerInstallationStep),repair=String(repairAndValidateInstallerCore_);
  assertTrue_(normalize.indexOf('INSTALLER_TIMEZONE')!==-1,'Configuração normalizada deve derivar do fuso horário canônico.');
  assertTrue_(prepare.indexOf('ensureInstallerSpreadsheetTimeZone_')!==-1,'Preparação da matriz oficial deve normalizar o fuso físico da planilha.');
  assertTrue_(step.indexOf('ensureInstallerSpreadsheetTimeZone_(ss,pending.config.timezone)')!==-1,'Passo inicial da instalação deve normalizar o fuso da cópia antes da criação da base.');
  assertTrue_(step.indexOf("'installation_timezone',ss.getSpreadsheetTimeZone()")!==-1,'Metadado da instalação deve registrar o fuso efetivamente confirmado na planilha.');
  assertTrue_(repair.indexOf('ensureInstallerSpreadsheetTimeZone_')!==-1,'Conferência final deve reparar novamente qualquer divergência de fuso.');

  let timezone='America/Los_Angeles',writes=0;
  const fakeSpreadsheet={
    getSpreadsheetTimeZone:function(){return timezone;},
    setSpreadsheetTimeZone:function(value){writes++;timezone=value;}
  };
  const corrected=ensureInstallerSpreadsheetTimeZone_(fakeSpreadsheet,INSTALLER_TIMEZONE);
  assertTrue_(corrected.changed,'Fuso divergente deve ser corrigido.');
  assertEquals_('America/Los_Angeles',corrected.previous,'Resultado deve preservar o fuso anterior para diagnóstico.');
  assertEquals_(INSTALLER_TIMEZONE,corrected.current,'Resultado deve confirmar o fuso aplicado.');
  assertEquals_(1,writes,'Correção deve executar uma única escrita quando houver divergência.');

  const unchanged=ensureInstallerSpreadsheetTimeZone_(fakeSpreadsheet,INSTALLER_TIMEZONE);
  assertFalse_(unchanged.changed,'Fuso já correto não deve gerar alteração desnecessária.');
  assertEquals_(1,writes,'Validação idempotente não deve regravar o fuso já correto.');
}


/** R39: pacote portátil preserva o estado sem carregar identidade ou integrações da instalação de origem. */
function testR39ProjectDistributionExportContract_() {
  assertTrue_(/^0\.0\.5-beta(?:16|17|1[89]|[2-9][0-9]+)-pv29$/.test(String(APP_VERSION)),'R39+ deve preservar a revisão beta16 ou posterior.');
  assertTrue_(['0.0.5-beta9-pv29','0.0.5-beta10-pv29'].indexOf(SCHEMA_VERSION)!==-1,'Exportação v1 deve permanecer compatível após a materialização R40.');
  assertEquals_('CALENDAR_PROJECT_DISTRIBUTION',PROJECT_DISTRIBUTION_FORMAT,'Formato portátil deve possuir identidade estável.');
  assertEquals_(1,PROJECT_DISTRIBUTION_FORMAT_VERSION,'Formato inicial deve ser versionado como v1.');
  assertTrue_(projectDistributionIsEligibleStatus_('FINALIZADO'),'Versão finalizada deve poder ser distribuída.');
  assertTrue_(projectDistributionIsEligibleStatus_('PUBLICADO'),'Versão publicada deve poder ser distribuída.');
  assertFalse_(projectDistributionIsEligibleStatus_('RASCUNHO'),'Rascunho não pode ser distribuído.');
  assertFalse_(projectDistributionIsEligibleStatus_('ARQUIVADO'),'Versão arquivada não deve ser distribuída por acidente.');

  const source={
    access:{email:'editor@example.org',editorEligible:true},
    installation:{installationId:'INST-ORIGEM',institution:'Instituição',unit:'Unidade',municipality:'Cidade',state:'MG',timezone:'America/Sao_Paulo'},
    project:{id:'PRJ-SRC',name:'Calendário Geral 2027',kind:'ACADEMICO'},
    calendar:{id:'CAL-SRC',title:'Calendário Geral 2027',kind:'ACADEMICO',status:'FINALIZADO',version_number:3,theme_id:'THEME-SRC'},
    calendarType:{code:'ACADEMICO',name:'Acadêmico',active:true},
    theme:{id:'THEME-SRC',name:'Tema origem',event_type_colors_json:'[]'},
    eventTypes:[{id:'TYPE-1',codigo:'TESTE',nome:'Teste',calendar_kind:'ACADEMICO',calendar_kinds:'ACADEMICO',ativo:true}],
    holidays:[{id:'HOL-1',name:'Feriado',scope:'NACIONAL',nature:'FIXO',month:1,day:1,active:true}],
    tables:{
      events:[{id:'EV-1',calendar_id:'CAL-SRC',event_type_id:'TYPE-1',title:'Evento',start_date:'2027-01-02',end_date:'',notes:'',color:''}],
      auditRuleOverrides:[{id:'AUD-1',calendar_id:'CAL-SRC',event_type_id:'TYPE-1',enabled:true}],
      schoolDaySettings:[{calendar_id:'CAL-SRC',monday:true,tuesday:true,wednesday:true,thursday:true,friday:true,saturday:false,sunday:false,targets_json:'[]'}],
      holidayOccurrences:[{id:'HO-1',holiday_id:'HOL-1',calendar_id:'CAL-SRC',year:2027,date:'2027-01-01'}],
      schoolDayExceptions:[{id:'EX-1',calendar_id:'CAL-SRC',date:'2027-02-01',is_replacement:false,replaced_date:'',description:'Teste'}]
    }
  };
  const document=buildProjectDistributionDocument_(source),canonical=projectDistributionCanonicalJson_(document.payload);
  assertEquals_(projectDistributionSha256Hex_(canonical),document.integrity.payloadSha256,'Hash deve representar exatamente o payload canônico.');
  assertEquals_('DERIVE_NEW_PROJECT',document.intent,'Pacote deve declarar que a importação criará Projeto independente.');
  assertTrue_(String(document.distributionId||'').indexOf('DIST-')===0,'Cada pacote deve possuir distributionId próprio.');
  assertEquals_(1,document.counts.events,'Contagem de eventos deve acompanhar o payload.');
  assertEquals_('INST-ORIGEM',document.sourceInstallation.installationId,'Origem da instalação deve permanecer rastreável.');
  const serialized=JSON.stringify(document);
  ['USERS','PROJECT_MEMBERS','PROJECT_EDIT_LEASES','PUBLIC_AGENDAS','SYSTEM_AUDIT','VERSION_SNAPSHOT_CHUNKS'].forEach(function(name){
    assertTrue_(document.exclusions.indexOf(name)!==-1,'Exclusão obrigatória ausente: '+name+'.');
  });
  assertFalse_(serialized.indexOf('google_calendar_id')!==-1,'Pacote não deve conter identidade de Agenda Google.');

  const backend=String(exportCalendarProjectDistribution)+String(collectProjectDistributionSource_);
  assertTrue_(backend.indexOf('DriveApp')===-1,'Exportação não deve exigir permissão adicional de Google Drive.');
  assertTrue_(backend.indexOf('editorEligible')!==-1,'Distribuição deve ser restrita a Editor/gestores, sem exigir lease de escrita.');
  assertTrue_(String(getAuthenticatedRpcHandler_).indexOf("case 'exportCalendarProjectDistribution'")!==-1,'RPC autenticada deve expor somente a operação de exportação prevista.');
  const html=HtmlService.createHtmlOutputFromFile('index').getContent();
  assertTrue_(html.indexOf("exportBtn.textContent='Exportar'")!==-1,'Gaveta deve oferecer Exportar em versões elegíveis.');
  assertTrue_(html.indexOf('new Blob(')!==-1&&html.indexOf(".calproj")!==-1,'Download deve ocorrer diretamente no navegador sem criar arquivo no Drive.');
}


/** R40 — Checklist única, persistente e materializada, sem segunda tabela de tarefas. */
function testR40ChecklistMaterializationContract_() {
  assertTrue_(['0.0.5-beta17-pv29','0.0.5-beta18-pv29'].indexOf(APP_VERSION)!==-1,'Contrato R40 deve permanecer disponível nas revisões beta17/beta18.');
  assertEquals_('0.0.5-beta10-pv29',SCHEMA_VERSION,'R40 deve elevar o schema para beta10.');
  assertTrue_(Array.isArray(DB_SCHEMA.CHECKLIST_ITEMS),'CHECKLIST_ITEMS deve ser tabela gerenciada do schema.');
  ['id','scope_type','scope_id','calendar_id','source_type','source_key','title','description','impact','recommended_action','status','payload_hash','payload_json','metadata_json','version'].forEach(function(column){assertTrue_(DB_SCHEMA.CHECKLIST_ITEMS.indexOf(column)!==-1,'CHECKLIST_ITEMS deve possuir '+column+'.');});
  const read=String(getCalendarAudit),build=String(buildCalendarAudit_),sync=String(syncMaterializedCalendarAudit_),materialized=String(readMaterializedCalendarAudit_);
  assertTrue_(read.indexOf('readMaterializedCalendarAudit_')!==-1,'Abertura de rascunho deve priorizar a Checklist materializada.');
  assertTrue_(build.indexOf('syncMaterializedCalendarAudit_')!==-1,'Motor de regras deve materializar o resultado após cálculo.');
  assertTrue_(sync.indexOf('payload_hash')!==-1&&sync.indexOf('unchanged')!==-1,'Persistência deve evitar reescrever itens sem alteração.');
  assertTrue_(materialized.indexOf("getRequiredSheet_('CHECKLIST_ITEMS')")!==-1,'Leitura da Checklist deve usar uma única tabela persistente.');
  assertTrue_(String(syncMaterializedCalendarAudit_).indexOf('[CHECKLIST PERF]')!==-1,'Materialização deve registrar métricas de tempo.');
}

/** R40 — importação valida, remapeia e reverte sem sobrescrever versões existentes. */
function testR40ProjectDistributionImportContract_() {
  const parse=String(parseProjectDistributionDocument_),preview=String(previewProjectDistributionImport),commit=String(importCalendarProjectDistribution),rollback=String(rollbackProjectImport_);
  assertTrue_(parse.indexOf('IMPORT_INTEGRITY_FAILED')!==-1&&parse.indexOf('IMPORT_BROKEN_REFERENCE')!==-1,'Pré-validação deve bloquear integridade e referências quebradas.');
  assertTrue_(preview.indexOf('projectImportWarning_')!==-1,'Prévia deve produzir avisos explicativos estruturados.');
  ['description','impact','importAction','recommendedAction'].forEach(function(field){assertTrue_(String(projectImportWarning_).indexOf(field)!==-1,'Aviso deve explicar '+field+'.');});
  assertTrue_(commit.indexOf("status:CALENDAR_VERSION_STATUS.DRAFT")!==-1,'Importação deve criar versão em Rascunho.');
  assertTrue_(commit.indexOf("'EVT-'+Utilities.getUuid()")!==-1,'Eventos importados devem receber IDs locais novos.');
  assertTrue_(rollback.indexOf("getRequiredSheet_('CHECKLIST_ITEMS')")!==-1&&rollback.indexOf("getRequiredSheet_('CALENDARS')")!==-1,'Rollback deve remover Checklist e versão parcial.');
  assertTrue_(commit.indexOf('PROJECT_IMPORT_BUDGET_MS')===-1||String(projectImportBudgetCheck_).indexOf('PROJECT_IMPORT_BUDGET_MS')!==-1,'Importação deve respeitar orçamento de execução.');
  assertTrue_(commit.indexOf('createChecklistTasksBatch_')!==-1,'Inconformidades aceitas devem gerar tarefas persistentes em lote.');
  assertTrue_(String(createChecklistTasksBatch_).indexOf('appendObjectsBatch_')!==-1,'Tarefas da importação devem usar uma única persistência em lote.');
  assertTrue_(parse.indexOf('IMPORT_DUPLICATE_ID')!==-1,'IDs duplicados no pacote devem bloquear referências ambíguas.');
  assertTrue_(String(projectImportPrimaryAuditYear_).indexOf('holidayOccurrences')!==-1,'Ano inicial da Checklist deve derivar do conteúdo importado.');
}

/** R40 — permissões de importação são mais restritas que a administração global de Projetos. */
function testR40ImportPermissionContract_() {
  const can=String(projectImportCanUseProject_),dest=String(projectImportDestinationState_),opts=String(getProjectImportOptions);
  assertTrue_(can.indexOf('isSuperuser')!==-1,'Superusuário deve poder importar em qualquer Projeto.');
  assertTrue_(can.indexOf('PROJECT_MEMBER_ROLE.EDITOR')!==-1,'Projeto existente deve exigir papel explícito de Editor para não-Superusuário.');
  assertTrue_(dest.indexOf('isAdministrator')!==-1&&dest.indexOf("mode:'NEW'")!==-1,'Administrador deve poder criar Projeto novo durante importação.');
  assertTrue_(dest.indexOf('IMPORT_DESTINATION_BUSY')!==-1,'Projeto com versão em elaboração deve ser bloqueado para preservar invariantes.');
  assertTrue_(opts.indexOf('colaboradores sem papel de Editor não podem importar')!==-1,'Colaborador puro deve receber bloqueio explícito.');
}

/** R40 — interface exibe cada aviso com causa, impacto e consequência. */
function testR40ImportUxContract_() {
  const html=HtmlService.createHtmlOutputFromFile('index').getContent();
  ['projectImportBtn','projectImportFile','projectImportModal','projectImportDestination','projectImportWarnings','analyzeProjectImportBtn','confirmProjectImportBtn'].forEach(function(id){assertTrue_(html.indexOf('id="'+id+'"')!==-1,'Controle de importação ausente: '+id+'.');});
  ['O que foi encontrado','Impacto','Se prosseguir','Ação recomendada'].forEach(function(label){assertTrue_(html.indexOf(label)!==-1,'Avisos da UI devem conter o rótulo explicativo: '+label+'.');});
  assertTrue_(html.indexOf("String(item.myRole||'').toUpperCase()==='EDITOR'")!==-1,'Botão Importar deve ser ocultado para Colaborador sem papel de Editor.');
  assertTrue_(String(getAuthenticatedRpcHandler_).indexOf("case 'importCalendarProjectDistribution'")!==-1&&String(getAuthenticatedRpcHandler_).indexOf("case 'setChecklistTaskStatus'")!==-1,'RPC autenticada deve expor importação e conclusão de tarefas.');
}

/** R42 — entradas enum inválidas são rejeitadas, nunca convertidas silenciosamente. */
function testR42StrictEnumValidationContract_() {
  assertFalse_(isKnownActiveStatusInput_('BANIDO'),'Status desconhecido não pode virar ATIVO.');
  assertTrue_(isKnownActiveStatusInput_('INATIVO'),'Status conhecido deve permanecer aceito.');
  assertFalse_(isKnownProjectMemberRoleInput_('DONO'),'Papel desconhecido não pode virar COLABORADOR.');
  assertTrue_(isKnownProjectMemberRoleInput_('EDITOR'),'EDITOR deve permanecer aceito.');
  assertFalse_(validateEventTypePayload_({code:'R42_TEST',name:'Teste',calendarKinds:['ACADEMICO'],schoolDayEffect:'QUEBRA_TUDO',visualRole:'PRINCIPAL'}).ok,'Efeito letivo inválido deve bloquear.');
  assertFalse_(validateEventTypePayload_({code:'R42_TEST',name:'Teste',calendarKinds:['ACADEMICO'],schoolDayEffect:'NEUTRO',visualRole:'ALIEN'}).ok,'Papel visual inválido deve bloquear.');
  assertTrue_(String(saveSystemUser).indexOf('profile === USER_PROFILE.PUBLIC')!==-1,'Perfil Público virtual não deve ser persistido em USERS.');
}

/** R42 — FINALIZAR valida o valor bruto da data antes da normalização. */
function testR42FinalizationRawDateIntegrityContract_() {
  assertFalse_(isValidStoredDateValue_('2027-13-40'),'Data impossível persistida deve ser detectada.');
  assertTrue_(isValidStoredDateValue_('2026-12-31'),'Data ISO válida deve ser aceita.');
  const source=String(buildFinalizationReport_);
  assertTrue_(source.indexOf("const eventRows = readTable_(getRequiredSheet_('EVENTS'))")!==-1,'Finalização deve ler os eventos brutos uma única vez.');
  assertTrue_(source.indexOf('isValidStoredDateValue_(rawEvent.start_date)')!==-1&&source.indexOf('isValidStoredDateValue_(rawEvent.end_date)')!==-1,'Finalização deve validar início e fim brutos.');
  assertFalse_(source.indexOf('listEvents_(calendar.id)')!==-1,'Finalização não deve adicionar uma segunda leitura de EVENTS.');
}

/** R42 — Tema rejeita URLs incompatíveis e conteúdo excessivo antes de qualquer escrita. */
function testR42ThemeInputHardeningContract_() {
  const unsafe=validateThemePayload_(Object.assign({},DEFAULT_THEMES[0],{id:'',version:0,name:'R42 Unsafe',logoUrl:'javascript:alert(1)'}));
  assertFalse_(unsafe.ok,'Logo incompatível deve ser rejeitado.');
  const huge=validateThemePayload_(Object.assign({},DEFAULT_THEMES[0],{id:'',version:0,name:'R42 Footer',footerText:new Array(1002).join('x')}));
  assertFalse_(huge.ok,'Rodapé acima de 1000 caracteres deve ser rejeitado.');
  const valid=validateThemePayload_(Object.assign({},DEFAULT_THEMES[0],{id:'',version:0,name:'R42 Válido',logoUrl:'https://iftm.edu.br/logo.png',footerText:'Rodapé'}));
  assertTrue_(valid.ok,'Tema válido deve continuar aceito.');
}

/** R42 — endurecimento deve ocorrer antes de lock e sem duplicar I/O. */
function testR42ValidationPerformanceContract_() {
  const userSource=String(saveSystemUser),themeSource=String(validateThemePayload_),finalSource=String(buildFinalizationReport_);
  assertTrue_(userSource.indexOf('isKnownActiveStatusInput_(payload.status)')<userSource.indexOf('LockService.getScriptLock()'),'Status inválido deve falhar antes do lock.');
  assertTrue_(themeSource.indexOf('footerText.length > 1000')!==-1&&themeSource.indexOf('logoUrl && !/^https?')!==-1,'Tema deve ser validado em memória antes da escrita.');
  const eventReads=(finalSource.match(/getRequiredSheet_\('EVENTS'\)/g)||[]).length;
  assertEquals_(1,eventReads,'Finalização R42 deve manter uma única leitura de EVENTS.');
}

/** R42 — importação fecha lacunas sem novas leituras de banco. */
function testR42ImportPreflightHardeningContract_() {
  const parse=String(parseProjectDistributionDocument_),preview=String(previewProjectDistributionImport);
  assertTrue_(parse.indexOf('IMPORT_EVENT_TYPE_REQUIRED')!==-1,'Evento importado sem Tipo deve bloquear estruturalmente.');
  ['EVENT_TITLE_MISSING','EVENT_DATE_MISSING','EVENT_TITLE_TOO_LONG','EVENT_NOTES_TOO_LONG'].forEach(function(code){assertTrue_(preview.indexOf(code)!==-1,'Prévia deve explicar '+code+'.');});
  ['ACADEMIC_SCHOOL_DAY_SETTINGS_IN_ADMIN','ACADEMIC_EXCEPTIONS_IN_ADMIN','ACADEMIC_PERIOD_TYPES_IN_ADMIN','ACADEMIC_RULES_IN_ADMIN'].forEach(function(code){assertTrue_(preview.indexOf(code)!==-1,'Acadêmico→Administrativo deve gerar tarefa específica '+code+'.');});
  const reads=(preview.match(/readTable_\(/g)||[]).length;
  assertTrue_(reads<=5,'Endurecimento R42 deve reutilizar os dados já carregados na prévia, sem multiplicar I/O.');
}

/** R20 — feedback de salvamento do CRUD permanece dentro do modal que iniciou a operação. */

/** R29 — uma RPC reutiliza Spreadsheet, Sheets e tabelas já lidas, invalidando-as após escrita. */
function testR29ExecutionCacheContract_() {
  const database=String(getDatabase_), required=String(getRequiredSheet_), read=String(readTable_), append=String(appendObject_), write=String(writeObjectToRow_);
  assertTrue_(database.indexOf('ctx.database')!==-1,'Spreadsheet deve ser resolvida no máximo uma vez por execução.');
  assertTrue_(required.indexOf('ctx.sheets')!==-1,'Referências de abas devem ser reutilizadas na mesma execução.');
  assertTrue_(read.indexOf('ctx.tables')!==-1,'Leituras tabulares devem usar cache por execução.');
  assertTrue_(append.indexOf('invalidateExecutionTableCache_')!==-1&&write.indexOf('invalidateExecutionTableCache_')!==-1,'Escritas precisam invalidar o cache da tabela.');
}

/** R29 — ensureSetup possui fast path temporário, mantendo fallback estrutural completo. */
function testR29SetupFastPathContract_() {
  const source=String(ensureSetup_);
  assertTrue_(source.indexOf('ctx.setupVerified')!==-1,'A mesma RPC não deve revalidar o schema várias vezes.');
  assertTrue_(source.indexOf('CacheService.getScriptCache()')!==-1,'RPCs sucessivas devem usar fast path curto para schema já validado.');
  assertTrue_(source.indexOf('Object.keys(DB_SCHEMA)')!==-1&&source.indexOf('SYSTEM_UPDATE_REQUIRED')!==-1&&source.indexOf("setup('UPDATE')")===-1,'Fast path deve validar o schema, mas nunca executar migração silenciosa durante a abertura.');
}

/** R29 — malha e auditoria acadêmica calculadas uma vez são reutilizadas até uma escrita acadêmica. */
function testR29DerivedAcademicCacheContract_() {
  const audit=String(buildCalendarAudit_), school=String(buildSchoolDayModel_), invalidation=String(invalidateExecutionDependentsForTable_);
  assertTrue_(audit.indexOf("getCachedDerivedValue_('audit'")!==-1&&audit.indexOf("setCachedDerivedValue_('audit'")!==-1,'Auditoria deve ser memoizada por calendário/ano na execução.');
  assertTrue_(school.indexOf("getCachedDerivedValue_('schoolDayModel'")!==-1&&school.indexOf("setCachedDerivedValue_('schoolDayModel'")!==-1,'Malha letiva deve ser memoizada por calendário na execução.');
  assertTrue_(invalidation.indexOf('invalidateDerivedExecutionCache_')!==-1&&invalidation.indexOf("'EVENTS'")!==-1,'Mutação de dados acadêmicos deve derrubar os derivados.');
}

/** R29 — submissão não espera Gmail; fila persiste antes da resposta e entrega ocorre em RPC separada. */
function testR29AsyncCollaborationNotificationContract_() {
  const submit=String(submitCollaborationSuggestion), dispatch=String(dispatchCollaborationNotifications), bridge=String(getAuthenticatedRpcHandler_);
  assertTrue_(submit.indexOf("queueSuggestionNotifications_(record,'SUBMITTED')")!==-1,'Notificação deve ser enfileirada antes da resposta.');
  assertFalse_(submit.indexOf('processPendingCollaborationNotifications_(record.id)')!==-1,'Submissão não pode aguardar Gmail no caminho crítico.');
  assertTrue_(dispatch.indexOf('processPendingCollaborationNotifications_')!==-1,'RPC assíncrona deve drenar a fila existente.');
  assertTrue_(bridge.indexOf("'dispatchCollaborationNotifications'")!==-1,'Ponte autenticada deve permitir o disparo assíncrono.');
}

/** R29 — consulta de um item da checklist não reconstrói feriados/malha/auditoria inteira. */
function testR29FocusedChecklistStateContract_() {
  const source=String(getChecklistStateForEventType_);
  assertTrue_(source.indexOf('auditEventType_')!==-1&&source.indexOf('getCalendarAuditRuleMap_')!==-1,'Estado focado deve usar a regra oficial do tipo.');
  assertFalse_(source.indexOf('buildCalendarAudit_')!==-1,'Consulta focada não deve construir a auditoria completa.');
}


/** R29 — polling de progresso valida token sem reler USERS e reduz frequência de RPC. */
function testR29ProgressPollingFastPathContract_() {
  const rpc=String(authenticatedRpc), fast=String(validateAuthAccessTokenForProgress_);
  const html=HtmlService.createHtmlOutputFromFile('index').getContent();
  assertTrue_(rpc.indexOf("method==='getOperationProgress'")!==-1&&rpc.indexOf('validateAuthAccessTokenForProgress_')!==-1,'Polling deve usar validação criptográfica sem consulta completa de usuário.');
  assertFalse_(fast.indexOf('getActiveAuthUserByEmail_')!==-1,'Fast path de progresso não pode reler USERS.');
  assertTrue_(html.indexOf('pollMeasuredOperationProgress(token,pollSeq,total);},900)')!==-1,'Polling geral deve ser limitado a aproximadamente uma consulta por segundo.');
}

/** R29 — vários destinatários são persistidos em uma única escrita matricial. */
function testR29NotificationBatchQueueContract_() {
  const queue=String(queueSuggestionNotificationsForRecipients_), batch=String(appendObjectsBatch_);
  assertTrue_(queue.indexOf('appendObjectsBatch_')!==-1,'Fila de notificações deve agrupar inserções.');
  assertTrue_(batch.indexOf('.setValues(matrix)')!==-1,'Inserção em lote deve usar uma única escrita matricial.');
}

/** R29 — exclusões contíguas e chunks de snapshot usam operações em lote. */
function testR29BatchMutationContract_() {
  const deletion=String(deleteRowsMatching_), snapshot=String(writeVersionSnapshot_), overrideDelete=String(deleteAuditOverridesForEventType_);
  assertTrue_(deletion.indexOf('.deleteRows(')!==-1,'Exclusões múltiplas devem ser agrupadas em blocos contíguos.');
  assertFalse_(deletion.indexOf('.deleteRow(')!==-1,'Helper de exclusão em massa não deve apagar linha por linha.');
  assertTrue_(snapshot.indexOf('appendObjectsBatch_')!==-1,'Chunks de snapshot devem ser persistidos em uma escrita matricial.');
  assertTrue_(overrideDelete.indexOf('deleteRowsMatching_')!==-1,'Limpeza de regras do tipo deve reutilizar exclusão em lote.');
}

function testR20UserSavingFeedbackScopeContract_() {
  const html=HtmlService.createHtmlOutputFromFile('index').getContent();
  const context=html.slice(html.indexOf('function currentContextFeedbackTarget_'),html.indexOf('function feedbackPresentation_'));
  assertTrue_(context.indexOf('[el.usersModal,el.usersFeedback]')!==-1,'Modal de usuários deve ser reconhecido pelo roteador de feedback contextual.');
  assertTrue_(context.indexOf('[el.collaborationDrawer,el.collaborationFeedback]')!==-1,'Painel de colaboração também deve manter processamento em seu próprio contexto.');
  const saving=html.slice(html.indexOf('function setSaving('),html.indexOf('function showFeedback('));
  assertTrue_(saving.indexOf('el.saveUserBtn')!==-1,'Botão Salvar usuário deve acompanhar o ciclo global de bloqueio/liberação.');
}

/** R20 — Configurações preserva os módulos anteriores mesmo com versão PUBLICADA. */
function testR20SettingsMenuRestorationContract_() {
  const html=HtmlService.createHtmlOutputFromFile('index').getContent();
  const start=html.indexOf('function openTools()'),end=html.indexOf('function closeTools()',start),openToolsCode=html.slice(start,end);
  ['eventTypesToolBtn','schoolDaysToolBtn','holidaysToolBtn','themesToolBtn'].forEach(function(id){assertTrue_(html.indexOf('id="'+id+'"')!==-1,'Atalho de Configurações ausente: '+id+'.');});
  assertFalse_(openToolsCode.indexOf('draft&&canEdit')!==-1,'Abrir Configurações não pode ocultar os módulos antigos apenas porque a versão atual está congelada.');
  assertTrue_(openToolsCode.indexOf('usersToolBtn.hidden')!==-1,'Usuários e acessos continua condicionado ao perfil administrativo.');
}

/** R22 — preferência de versão aberta é isolada pela sessão própria do sistema. */
function testR22ActiveCalendarSessionIsolationContract_() {
  const key=String(activeCalendarSessionCacheKey_),session=String(getRequestSessionKey_),read=String(readUserActiveCalendarId_),write=String(setUserActiveCalendarId_);
  assertTrue_(key.indexOf('getRequestSessionKey_')!==-1&&key.indexOf('ACTIVE_CALENDAR_SESSION_PREFIX')!==-1,'Versão aberta deve usar a sessão autoritativa do Calendário, não depender da sessão Google.');
  assertTrue_(session.indexOf('identity.sessionKey')!==-1,'Token por e-mail deve fornecer chave própria para isolar a navegação do visitante.');
  assertTrue_(read.indexOf('CacheService.getScriptCache()')!==-1&&read.indexOf('UserProperties')===-1,'Leitura da versão ativa deve usar somente cache da sessão própria.');
  assertTrue_(write.indexOf('CAL_AUTH_CONFIG.SESSION_TTL_SECONDS')!==-1&&write.indexOf('UserProperties')===-1,'Escrita deve permanecer isolada pelo token próprio e nunca usar UserProperties Google.');
}

function runAllTests() {
  const startedAt = new Date();
  const tests = getSystemTests_();

  console.log('[TESTES] Iniciando runAllTests() — ' + tests.length + ' teste(s) | app ' + APP_VERSION + ' | schema ' + SCHEMA_VERSION + '.');
  const results = [];

  tests.forEach(function(test, index) {
    const name = test.name;
    const number = index + 1;
    const testStartedAt = new Date();
    console.log('[TESTE ' + number + '/' + tests.length + '] INÍCIO — ' + name);
    try {
      test();
      const elapsedMs = new Date().getTime() - testStartedAt.getTime();
      results.push({ name: name, ok: true, elapsedMs: elapsedMs });
      console.log('[TESTE ' + number + '/' + tests.length + '] ✓ APROVADO — ' + name + ' (' + elapsedMs + ' ms)');
    } catch (error) {
      const elapsedMs = new Date().getTime() - testStartedAt.getTime();
      const message = error && error.message ? error.message : String(error);
      results.push({ name: name, ok: false, message: message, elapsedMs: elapsedMs });
      console.error('[TESTE ' + number + '/' + tests.length + '] ✗ FALHOU — ' + name + ' (' + elapsedMs + ' ms) | ' + message);
      if (error && error.stack) console.error(error.stack);
    } finally {
      try { cleanupTestDefaultCalendar_(); } catch (cleanupError) { console.warn('[TESTES] Limpeza do calendário temporário: ' + (cleanupError && cleanupError.message ? cleanupError.message : cleanupError)); }
    }
  });

  const passed = results.filter(function(item) { return item.ok; }).length;
  const failed = results.length - passed;
  const elapsedMs = new Date().getTime() - startedAt.getTime();
  const summary = passed + '/' + results.length + ' testes aprovados';

  console.log('[TESTES] --------------------------------------------------');
  results.forEach(function(item, index) {
    console.log('[TESTES] ' + (index + 1) + '. ' + (item.ok ? '✓' : '✗') + ' ' + item.name + ' — ' + item.elapsedMs + ' ms' + (item.message ? ' — ' + item.message : ''));
  });
  console.log('[TESTES] RESUMO: ' + summary + ' | falhas=' + failed + ' | duração=' + elapsedMs + ' ms.');
  console.log('[TESTES] ' + (failed === 0 ? 'SUCESSO: suíte concluída sem falhas.' : 'ATENÇÃO: existem testes com falha; consulte os registros acima.'));

  return {
    ok: failed === 0,
    passed: passed,
    failed: failed,
    total: results.length,
    elapsedMs: elapsedMs,
    summary: summary,
    results: results
  };
}

function runTestsFromMenu() {
  showSpreadsheetProcessDialog_('TESTS');
}

function getTestMenuPlan_() {
  return getSystemTests_().map(function(test, index) {
    return {
      index: index,
      label: 'Teste ' + (index + 1) + ': ' + test.name
    };
  });
}

function runTestMenuStep_(index) {
  const tests = getSystemTests_();
  const test = tests[Number(index)];
  if (!test) throw new Error('Teste inexistente: ' + index);
  const startedAt = new Date();
  try {
    test();
    return { ok:true, label:test.name, elapsedMs:new Date().getTime()-startedAt.getTime(), detail:'✓ APROVADO — '+test.name };
  } catch (error) {
    return { ok:false, label:test.name, elapsedMs:new Date().getTime()-startedAt.getTime(), detail:'✗ FALHOU — '+test.name+' | '+(error&&error.message?error.message:String(error)), message:error&&error.message?error.message:String(error) };
  } finally {
    try { cleanupTestDefaultCalendar_(); } catch (cleanupError) {}
  }
}

function runTestsForMenuExecution() {
  const result = runAllTests();
  const lines = result.results.map(function(item, index) {
    return '[TESTE ' + (index + 1) + '/' + result.total + '] ' + (item.ok ? '✓ APROVADO' : '✗ FALHOU') +
      ' — ' + item.name + ' (' + item.elapsedMs + ' ms)' + (item.message ? ' | ' + item.message : '');
  });
  lines.push('');
  lines.push('[RESUMO] ' + result.summary + ' | falhas=' + result.failed + ' | duração=' + result.elapsedMs + ' ms.');
  return {
    ok: result.ok,
    title: result.ok ? 'Testes concluídos sem falhas' : 'Há testes com falha',
    summary: result.summary + (result.failed ? ' — ' + result.failed + ' falha(s).' : '.'),
    lines: lines,
    metrics: [
      'Aprovados: ' + result.passed,
      'Falhas: ' + result.failed,
      'Total: ' + result.total,
      'Duração: ' + result.elapsedMs + ' ms'
    ]
  };
}

function testIsoDateValidation_() {
  assertTrue_(isIsoDate_('2026-08-11'), 'Data ISO válida deveria ser aceita.');
  assertFalse_(isIsoDate_('2026-02-30'), 'Data impossível deveria ser rejeitada.');
  assertFalse_(isIsoDate_('11/08/2026'), 'Formato não ISO deveria ser rejeitado.');
}

function testStoredDateNormalization_() {
  const date = new Date(2097, 11, 28, 12, 0, 0);
  assertEquals_('2097-12-28', storedDateToIso_(date), 'Datas retornadas pelo Sheets como Date devem voltar ao domínio como ISO.');
  assertEquals_('2098-01-07', storedDateToIso_('2098-01-07'), 'Texto ISO deve ser preservado.');
  assertEquals_('', storedDateToIso_('data inválida'), 'Valor inválido não deve ser interpretado como data.');
}

function testEventValidation_() {
  assertFalse_(validateEventPayload_(normalizeEventPayload_({
    eventTypeId: '',
    title: 'Evento sem regra',
    startDate: '2026-08-11',
    endDate: '2026-08-11'
  })).ok, 'Evento sem regra/tipo associado deveria falhar.');

  assertTrue_(validateEventPayload_(normalizeEventPayload_({
    eventTypeId: 'TYPE-TEST',
    title: 'Evento de teste',
    startDate: '2026-08-11',
    endDate: '2026-08-11'
  })).ok, 'Evento válido deveria passar.');

  assertFalse_(validateEventPayload_(normalizeEventPayload_({
    eventTypeId: 'TYPE-TEST',
    title: '',
    startDate: '2026-08-11',
    endDate: '2026-08-11'
  })).ok, 'Título vazio deveria falhar.');

  assertFalse_(validateEventPayload_(normalizeEventPayload_({
    eventTypeId: 'TYPE-TEST',
    title: 'Intervalo inválido',
    startDate: '2026-08-12',
    endDate: '2026-08-11'
  })).ok, 'Fim anterior ao início deveria falhar.');
}

function testDynamicEventDateRequirements_() {
  const endOnlyType = { startRequired: false, endRequired: true };
  const startOnlyType = { startRequired: true, endRequired: false };
  const bothType = { startRequired: true, endRequired: true };

  let result = validateEventDatesByType_({ startDate: '', endDate: '2026-08-20' }, endOnlyType);
  assertTrue_(result.ok, 'Evento parcial deve poder ser salvo.');
  assertTrue_(result.complete, 'Tipo com somente término obrigatório e término informado deve estar completo.');

  result = validateEventDatesByType_({ startDate: '2026-08-20', endDate: '' }, bothType);
  assertTrue_(result.ok, 'Evento com data obrigatória pendente deve poder ser salvo.');
  assertFalse_(result.complete, 'Evento com término obrigatório ausente deve permanecer incompleto.');
  assertEquals_(1, result.missingRequiredDates.length, 'Deve existir exatamente uma data obrigatória pendente.');
  assertEquals_('END_DATE', result.missingRequiredDates[0], 'A pendência deveria ser a data final.');

  result = validateEventDatesByType_({ startDate: '', endDate: '2026-08-20' }, startOnlyType);
  assertTrue_(result.ok, 'Evento parcial com somente término conhecido deve poder ser persistido.');
  assertFalse_(result.complete, 'Tipo com início obrigatório deve permanecer incompleto quando início está vazio.');
}

function testQuarterlyPeriodicity_() {
  const intervals = buildAuditIntervals_(2097, 1, 'TRIMESTRE');
  assertEquals_(3, intervals.length, 'A periodicidade TRIMESTRE deve produzir três janelas no ano de auditoria.');
  assertEquals_('1º trimestre', intervals[0].label, 'Primeira janela trimestral deve ser identificada claramente.');
  assertEquals_('2º trimestre', intervals[1].label, 'Segunda janela trimestral deve ser identificada claramente.');
  assertEquals_('3º trimestre', intervals[2].label, 'Terceira janela trimestral deve ser identificada claramente.');
}

function testUiContract_() {
  const html = HtmlService.createHtmlOutputFromFile('index').getContent();
  assertTrue_(html.indexOf('id="auditBtn"') !== -1, 'A Auditoria deve existir explicitamente na barra principal.');
  assertTrue_(html.indexOf('Tipo / categoria *') !== -1, 'O editor deve tratar Tipo como categoria e conectar a checklist de forma contextual.');
  assertTrue_(html.indexOf('id="eventTypeIdSelect" required') !== -1, 'A associação evento → categoria deve ser obrigatória no formulário.');
  assertTrue_(html.indexOf('id="eventTypeCalendarKinds"') !== -1, 'O CRUD de tipos deve oferecer seleção de um ou mais tipos de calendário.');
  assertTrue_(html.indexOf('selectedEventTypeCalendarKinds()') !== -1, 'O frontend deve enviar todas as associações de calendário selecionadas.');
  assertTrue_(html.indexOf('id="startDateRequirement"') !== -1 && html.indexOf('id="endDateRequirement"') !== -1, 'O formulário deve indicar dinamicamente a exigência das datas.');
  assertTrue_(html.indexOf('id="schoolDaysToolBtn"') !== -1 && html.indexOf('id="schoolDayModal"') !== -1, 'A configuração da semana-base deve continuar disponível sobre a folha.');
  assertTrue_(html.indexOf('id="holidaysToolBtn"') !== -1 && html.indexOf('id="holidaysModal"') !== -1, 'O CRUD do catálogo de feriados deve continuar disponível nas ferramentas.');
  assertTrue_(html.indexOf('id="holidayOccurrenceDate"') === -1 && html.indexOf('id="saveHolidayOccurrenceBtn"') === -1, 'A data anual do feriado variável não deve ser cadastrada no CRUD de feriados.');
  assertTrue_(html.indexOf('openVariableHolidayEvent(item.holidayId, year)') !== -1, 'Auditoria → Definir data deve abrir o editor único de eventos.');
  assertTrue_(html.indexOf("el.drawerTitle.textContent = 'Editar evento';") !== -1, 'O fluxo de feriado variável deve manter explicitamente a mesma janela Editar Evento.');
  assertTrue_(html.indexOf('id="schoolDayExceptionsToolBtn"') === -1 && html.indexOf('id="schoolDayExceptionsModal"') === -1, 'Não deve existir tela separada de dias letivos excepcionais.');
  assertTrue_(html.indexOf('id="schoolDayExceptionEventFields"') !== -1 && html.indexOf('id="eventIsReplacement"') !== -1, 'Reposição deve ser configurada dentro do mesmo editor de eventos.');
  assertTrue_(html.indexOf("EDITOR_TYPE_SCHOOL_DAY_EXCEPTION") !== -1, 'Dia letivo excepcional deve ser uma opção do editor único.');
  assertTrue_(html.indexOf('O sistema apenas sugere uma descrição') !== -1 || html.indexOf('o sistema apenas sugere uma descrição') !== -1, 'A sugestão de reposição deve preservar o controle do usuário.');
  assertTrue_(html.indexOf('dayCellTopContent: renderSchoolDayCellTop') !== -1, 'O marcador letivo deve continuar junto ao número do dia.');
  assertTrue_(html.indexOf("item.textContent = 'S' + (index + 1) + '=' + count") !== -1, 'O resumo mensal deve exibir S1=X.');
  assertTrue_(html.indexOf("totalText.textContent='Total=' + monthData.total") !== -1, 'O resumo mensal deve exibir Total=X acompanhado do marcador visual de dia letivo.');
  assertTrue_(html.indexOf("title: (isStart ? 'Início do ' : 'Fim do ') + event.title") !== -1, 'Período letivo deve manter os marcos independentes de início/fim.');
  assertTrue_(html.indexOf("document.querySelectorAll('.admin-modal')") !== -1 && html.indexOf("header.addEventListener('pointerdown'") !== -1, 'Modais administrativos devem continuar arrastáveis.');
  assertTrue_(html.indexOf('id="operationShield"') !== -1 && html.indexOf('function setApplicationInteractionBlocked(active)') !== -1 && html.indexOf('el.appRoot.inert = true;') !== -1, 'Operações críticas devem bloquear a interface por meio do helper global.');
}

function testUnifiedEventEditorContract_() {
  const html = HtmlService.createHtmlOutputFromFile('index').getContent();
  const confirmIndex = html.indexOf('id="deleteConfirm"');
  const formIndex = html.indexOf('id="eventForm"');
  assertTrue_(confirmIndex !== -1 && formIndex !== -1 && confirmIndex < formIndex, 'A confirmação de exclusão deve ficar fora/acima da área rolável do formulário.');
  assertTrue_(html.indexOf('openVariableHolidayEvent') !== -1 && html.indexOf('EDITOR_TYPE_VARIABLE_HOLIDAY') !== -1, 'Feriado variável deve usar Editar Evento.');
  assertTrue_(html.indexOf('submitVariableHolidayFromEditor') !== -1, 'Salvar feriado variável deve partir do editor único.');
  assertTrue_(html.indexOf('openSchoolDayExceptionEvent') !== -1 && html.indexOf('submitSchoolDayExceptionFromEditor') !== -1, 'Dia letivo excepcional deve abrir e salvar pelo editor único.');
  assertTrue_(html.indexOf("if (sourceKind === 'SCHOOL_DAY_EXCEPTION')") !== -1, 'Clicar em exceção existente deve ser tratado pelo editor único.');
  assertTrue_(html.indexOf('pendingExceptionDates') !== -1 && html.indexOf('ainda não contabilizado') !== -1, 'O editor único deve preservar o aviso quando a exceção ainda está fora de período letivo completo.');
  assertTrue_(html.indexOf('previousSuggestion') !== -1 && html.indexOf("el.eventTitle.value = 'Dia letivo excepcional'") !== -1, 'Desligar reposição deve remover a sugestão automática sem sobrescrever texto livre do usuário.');
  assertTrue_(html.indexOf('id="deleteConfirmText"') !== -1 && html.indexOf('voltará a ser pendência na Checklist') !== -1 && html.indexOf('contagens de dias letivos serão recalculadas imediatamente') !== -1, 'A confirmação de exclusão deve explicar o impacto conforme o tipo de ocorrência.');
}

function testEventTypeMultipleCalendarKinds_() {
  setup('TEST');
  const marker = 'MULTI_' + Utilities.getUuid().replace(/-/g, '').slice(0, 10).toUpperCase();
  let typeId = '';
  let eventId = '';
  try {
    const created = saveEventType({
      code: marker,
      name: 'Tipo multicalendário temporário',
      calendarKinds: ['ACADEMICO', 'ADMINISTRATIVO'],
      startRequired: true,
      endRequired: false,
      required: false,
      active: true
    });
    assertTrue_(created.ok, 'Deve ser possível criar um tipo aplicável a dois tipos de calendário.');
    typeId = created.eventType.id;
    assertEquals_(2, created.eventType.calendarKinds.length, 'O tipo deve preservar as duas associações.');
    assertTrue_(listEventTypesForCalendarKind_('ACADEMICO', false).some(function(item) { return item.id === typeId; }), 'O tipo deve aparecer no catálogo acadêmico.');
    assertTrue_(listEventTypesForCalendarKind_('ADMINISTRATIVO', false).some(function(item) { return item.id === typeId; }), 'O tipo deve aparecer no catálogo administrativo.');

    const event = saveEvent({
      calendarId: DEFAULT_CALENDAR_ID,
      eventTypeId: typeId,
      title: 'Uso acadêmico do tipo múltiplo',
      startDate: '2096-03-10',
      endDate: '',
      notes: '',
      auditYear: 2096
    });
    assertTrue_(event.ok, 'O tipo múltiplo deve poder ser usado no calendário acadêmico.');
    eventId = event.event.id;

    const removal = saveEventType({
      id: typeId,
      version: created.eventType.version,
      code: marker,
      name: 'Tipo multicalendário temporário',
      calendarKinds: ['ADMINISTRATIVO'],
      startRequired: true,
      endRequired: false,
      required: false,
      active: true
    });
    assertFalse_(removal.ok, 'Não deve ser possível remover uma associação de calendário que já possui eventos.');
    assertEquals_('IN_USE', removal.code, 'A remoção de associação em uso deve ser explicitamente bloqueada.');
  } finally {
    if (eventId) forceDeleteTestEvent_(eventId);
    if (typeId) forceDeleteTestEventType_(typeId);
  }
}

function testMenuProgressPlan_() {
  const setupPlan = getSetupMenuPlan_('UPDATE');
  assertEquals_(10, setupPlan.length, 'O setup pelo menu deve possuir dez etapas mensuráveis.');
  assertTrue_(setupPlan.every(function(step) { return !!step.label; }), 'Cada etapa do setup deve possuir descrição clara.');

  const testPlan = getTestMenuPlan_();
  assertEquals_(getSystemTests_().length, testPlan.length, 'O plano visual de testes deve refletir toda a suíte.');
  assertTrue_(testPlan.every(function(step) { return !!step.label; }), 'Cada teste exibido no progresso deve possuir descrição.');
}

function testSetupIdempotency_() {
  const first = setup('TEST');
  const second = setup('TEST');

  assertEquals_(APP_VERSION, first.version, 'Primeiro setup retornou versão inesperada.');
  assertEquals_(APP_VERSION, second.version, 'Segundo setup retornou versão inesperada.');
  Object.keys(DB_SCHEMA).forEach(function(name) {
    assertTrue_(!!getDatabase_().getSheetByName(name), 'Aba ausente: ' + name);
  });
}

function testSchema005Migration_() {
  setup('TEST');
  const ss = getDatabase_();
  const markerId = 'CAL-MIGRATION-' + Utilities.getUuid().replace(/-/g, '').slice(0, 8).toUpperCase();
  appendTestAcademicCalendar_(markerId, 'Registro preservado durante migração');
  try {
    ['HOLIDAYS', 'HOLIDAY_OCCURRENCES', 'SCHOOL_DAY_EXCEPTIONS', 'THEMES'].forEach(function(name) {
      const sheet = ss.getSheetByName(name);
      if (sheet) ss.deleteSheet(sheet);
    });
    const eventTypeSheet = ss.getSheetByName('EVENT_TYPES');
    const legacyRows = readTable_(eventTypeSheet);
    const legacyIndex = legacyRows.findIndex(function(row) { return String(row.codigo || '') === 'PERIODO_LETIVO'; });
    if (legacyIndex !== -1) {
      writeObjectToRow_(eventTypeSheet, legacyIndex + 2, Object.assign({}, legacyRows[legacyIndex], {
        calendar_kind: 'ACADEMICO',
        calendar_kinds: '',
        efeito_dias_letivos: ''
      }));
    }

    const migrated = setup('TEST');
    assertEquals_(SCHEMA_VERSION, migrated.schemaVersion, 'A atualização deve persistir o schema atual.');
    ['HOLIDAYS', 'HOLIDAY_OCCURRENCES', 'SCHOOL_DAY_EXCEPTIONS', 'THEMES'].forEach(function(name) {
      assertTrue_(!!ss.getSheetByName(name), 'A migração deve preservar/criar a aba ' + name + '.');
    });
    assertTrue_(!!getCalendarById_(markerId), 'Dados já existentes não podem ser apagados ao criar as novas estruturas.');
    const migratedTypes = readTable_(eventTypeSheet);
    assertTrue_(!migratedTypes.some(function(row){return String(row.codigo||'')==='PERIODO_LETIVO';}), 'O período letivo genérico legado deve ser removido pelo setup.');
    canonicalSchoolPeriodCodes_().forEach(function(code){const row=migratedTypes.find(function(item){return String(item.codigo||'')===code;});assertTrue_(!!row,'Período canônico ausente após migração: '+code);assertEquals_('ACADEMICO',String(row.calendar_kinds||''),'Período canônico deve pertencer ao calendário acadêmico.');assertEquals_('NEUTRO',String(row.efeito_dias_letivos||''),'Período canônico deve ser neutro para a contagem por si só.');});
  } finally {
    forceDeleteTestCalendar_(markerId);
  }
}

function testSetupMenuStepExecution_() {
  setup('TEST');
  const plan = getSetupMenuPlan_('UPDATE');
  plan.forEach(function(step, index) {
    const result = runSetupMenuStep_(index,'UPDATE');
    assertTrue_(result && result.ok, 'A etapa visual ' + (index + 1) + '/' + plan.length + ' do setup deve concluir com sucesso.');
    assertTrue_(!!result.detail, 'Cada etapa visual do setup deve devolver contexto concreto para o usuário.');
  });
}

function testBootstrap005Contract_() {
  setup('TEST');
  const data = getBootstrapData(DEFAULT_CALENDAR_ID);
  assertTrue_(!!data.calendar, 'Bootstrap explícito deve devolver o calendário solicitado.');
  assertTrue_(!!data.holidayData && Array.isArray(data.holidayData.holidays) && Array.isArray(data.holidayData.occurrences), 'Bootstrap deve devolver catálogo/ocorrências de feriados.');
  assertTrue_(Array.isArray(data.schoolDayExceptions), 'Bootstrap deve devolver dias letivos excepcionais.');
  assertTrue_(!!data.schoolDayModel && Array.isArray(data.schoolDayModel.dates), 'Bootstrap deve devolver snapshot calculado da malha letiva.');
}

function testCalendarTypeSeed_() {
  setup('TEST');
  const types = listCalendarTypes_();
  assertEquals_(2, types.length, 'Devem existir exatamente dois tipos estruturais de calendário.');
  assertTrue_(types.some(function(item) { return item.code === 'ACADEMICO'; }), 'Tipo ACADEMICO ausente.');
  assertTrue_(types.some(function(item) { return item.code === 'ADMINISTRATIVO'; }), 'Tipo ADMINISTRATIVO ausente.');

  const calendar = getCalendarById_(DEFAULT_CALENDAR_ID);
  assertEquals_('ACADEMICO', calendar.kind, 'O calendário inicial deve ser acadêmico nesta instalação.');
}

function testEventTypeSeedIdempotency_() {
  setup('TEST');
  const first = readTable_(getRequiredSheet_('EVENT_TYPES'));
  const firstAdminCount = first.filter(function(row) { return String(row.calendar_kind || '') === 'ADMINISTRATIVO'; }).length;
  setup('TEST');
  const second = readTable_(getRequiredSheet_('EVENT_TYPES'));
  const secondAdminCount = second.filter(function(row) { return String(row.calendar_kind || '') === 'ADMINISTRATIVO'; }).length;

  DEFAULT_EVENT_TYPES.forEach(function(definition) {
    const code = definition[0];
    const occurrences = second.filter(function(row) {
      return String(row.codigo || '') === code && String(row.calendar_kind || '') === 'ACADEMICO';
    }).length;
    assertEquals_(1, occurrences, 'O setup deve manter exatamente um pré-cadastro acadêmico para ' + code + '.');
  });
  assertEquals_(firstAdminCount, secondAdminCount, 'O setup não deve inserir tipos no catálogo administrativo.');
  assertEquals_(first.length, second.length, 'O setup repetido não deve duplicar tipos de evento.');

  const periodTypes = listEventTypes_(true).filter(function(item) { return item.calendarKind === 'ACADEMICO' && canonicalSchoolPeriodCodes_().indexOf(item.code)!==-1; });
  assertEquals_(3,periodTypes.length,'O catálogo acadêmico deve conter exatamente os três períodos letivos canônicos.');
  assertTrue_(periodTypes.every(function(item){return item.schoolPeriod&&item.schoolDayTargetEnabled;}),'Todos os períodos canônicos devem delimitar a malha e possuir meta.');
}

function testEventTypeCrudRoundTrip_() {
  const marker = 'TEST_' + Utilities.getUuid().replace(/-/g, '').slice(0, 12).toUpperCase();
  let createdId = '';

  try {
    const created = saveEventType({
      code: marker,
      name: 'Tipo temporário de teste',
      calendarKind: 'ADMINISTRATIVO',
      startRequired: true,
      endRequired: false,
      periodicityValue: 1,
      periodicityUnit: 'SEMESTRE',
      expectedQuantity: 1,
      quantityRule: '>=',
      required: false,
      active: true
    });
    assertTrue_(created.ok, 'Falha ao criar tipo de evento de teste.');
    createdId = created.eventType.id;
    assertEquals_('ADMINISTRATIVO', created.eventType.calendarKind, 'Tipo criado deveria pertencer ao calendário administrativo.');
    assertEquals_(1, created.eventType.version, 'Versão inicial do tipo deveria ser 1.');

    const updated = saveEventType({
      id: created.eventType.id,
      version: created.eventType.version,
      code: marker,
      name: 'Tipo temporário atualizado',
      calendarKind: 'ADMINISTRATIVO',
      startRequired: true,
      endRequired: true,
      periodicityValue: 1,
      periodicityUnit: 'ANO',
      expectedQuantity: 2,
      quantityRule: '=',
      required: false,
      active: false
    });
    assertTrue_(updated.ok, 'Falha ao atualizar tipo de evento de teste.');
    assertEquals_(2, updated.eventType.version, 'Versão atualizada do tipo deveria ser 2.');
    assertFalse_(updated.eventType.active, 'O tipo deveria estar inativo após a atualização.');

    const listed = listEventTypes_(true).find(function(item) { return item.id === createdId; });
    assertTrue_(!!listed, 'Tipo criado deveria aparecer na listagem administrativa.');
  } finally {
    if (createdId) forceDeleteTestEventType_(createdId);
  }
}

function testEventCrudRoundTrip_() {
  setup('TEST');
  const marker = '[TEST] ' + Utilities.getUuid();
  const eventType = listEventTypesForCalendarKind_('ACADEMICO', false)[0];
  assertTrue_(!!eventType, 'É necessário ao menos um tipo acadêmico ativo para o teste.');
  let createdId = '';

  try {
    const created = saveEvent({
      calendarId: DEFAULT_CALENDAR_ID,
      eventTypeId: eventType.id,
      title: marker,
      startDate: '2026-08-11',
      endDate: '2026-08-12',
      notes: 'Registro temporário do teste de integração.',
      auditYear: 2026
    });

    assertTrue_(created.ok, 'Falha ao criar evento de teste.');
    createdId = created.event.id;
    assertEquals_(eventType.id, created.event.eventTypeId, 'Evento deveria preservar o tipo selecionado.');
    assertEquals_(1, created.event.version, 'Versão inicial deveria ser 1.');
    assertTrue_(!!created.audit, 'Salvar evento deve devolver um snapshot sincronizado da auditoria.');

    const updated = saveEvent({
      id: created.event.id,
      calendarId: DEFAULT_CALENDAR_ID,
      eventTypeId: eventType.id,
      title: marker + ' atualizado',
      startDate: '2026-08-12',
      endDate: '2026-08-13',
      notes: '',
      version: created.event.version,
      auditYear: 2026
    });

    assertTrue_(updated.ok, 'Falha ao atualizar evento de teste.');
    assertEquals_(2, updated.event.version, 'Versão atualizada deveria ser 2.');

    const removed = deleteEvent(updated.event.id, updated.event.version, DEFAULT_CALENDAR_ID, 2026);
    assertTrue_(removed.ok, 'Falha ao excluir evento de teste.');
    assertTrue_(!!removed.audit, 'Excluir evento deve devolver um snapshot sincronizado da auditoria.');
    createdId = '';
  } finally {
    if (createdId) forceDeleteTestEvent_(createdId);
  }
}

function testAuditQuantityProgress_() {
  setup('TEST');
  const marker = 'AUDIT_QTY_' + Utilities.getUuid().replace(/-/g, '').slice(0, 10).toUpperCase();
  let typeId = '';
  const eventIds = [];

  try {
    const typeResult = saveEventType({
      code: marker,
      name: 'Regra temporária 2 por semestre',
      calendarKind: 'ACADEMICO',
      startRequired: true,
      endRequired: true,
      calendarId: DEFAULT_CALENDAR_ID,
      auditYear: 2098,
      auditRule: { enabled:true, expectedQuantity:2, quantityRule:'>=', periodUnit:'SEMESTRE' },
      active: true
    });
    assertTrue_(typeResult.ok, 'Falha ao criar regra temporária de quantidade.');
    typeId = typeResult.eventType.id;

    let audit = getCalendarAudit(DEFAULT_CALENDAR_ID, 2098);
    let item = audit.items.find(function(row) { return row.eventTypeId === typeId; });
    assertEquals_('PENDENTE', item.status, 'Sem ocorrências, a regra deve estar pendente.');
    assertEquals_(0, item.checks[0].count, 'Primeiro semestre deve iniciar em 0/2.');

    const first = saveEvent({
      calendarId: DEFAULT_CALENDAR_ID,
      eventTypeId: typeId,
      title: 'Ocorrência 1/2 — primeiro semestre',
      startDate: '2098-01-10',
      endDate: '2098-01-15',
      notes: '',
      auditYear: 2098
    });
    assertTrue_(first.ok, 'Falha ao criar primeira ocorrência.');
    eventIds.push(first.event.id);
    item = first.audit.items.find(function(row) { return row.eventTypeId === typeId; });
    assertEquals_('PARCIAL', item.status, 'Uma de duas ocorrências deve produzir atendimento parcial.');
    assertEquals_(1, item.checks[0].count, 'Primeiro semestre deveria indicar 1/2.');
    assertTrue_(item.checks[0].partial, 'Check 1/2 deve estar marcado como parcial.');

    const second = saveEvent({
      calendarId: DEFAULT_CALENDAR_ID,
      eventTypeId: typeId,
      title: 'Ocorrência 2/2 — primeiro semestre',
      startDate: '2098-02-10',
      endDate: '2098-02-15',
      notes: '',
      auditYear: 2098
    });
    assertTrue_(second.ok, 'Falha ao criar segunda ocorrência.');
    eventIds.push(second.event.id);
    item = second.audit.items.find(function(row) { return row.eventTypeId === typeId; });
    assertTrue_(item.checks[0].ok, 'Duas ocorrências devem atender completamente o primeiro semestre.');
    assertEquals_(2, item.checks[0].count, 'Primeiro semestre deveria indicar 2/2.');
    assertEquals_('PARCIAL', item.status, 'A regra global ainda é parcial enquanto o segundo semestre estiver pendente.');

    ['2098-07-10', '2098-08-10'].forEach(function(date, index) {
      const result = saveEvent({
        calendarId: DEFAULT_CALENDAR_ID,
        eventTypeId: typeId,
        title: 'Ocorrência ' + (index + 1) + '/2 — segundo semestre',
        startDate: date,
        endDate: date,
        notes: '',
        auditYear: 2098
      });
      assertTrue_(result.ok, 'Falha ao completar segundo semestre.');
      eventIds.push(result.event.id);
      audit = result.audit;
    });

    item = audit.items.find(function(row) { return row.eventTypeId === typeId; });
    assertEquals_('ATENDIDA', item.status, 'Com 2/2 em cada semestre, a regra deve estar atendida.');
    assertTrue_(item.checks.every(function(check) { return check.ok; }), 'Todos os intervalos da regra devem estar atendidos.');
  } finally {
    eventIds.forEach(forceDeleteTestEvent_);
    if (typeId) forceDeleteTestEventType_(typeId);
  }
}

function testIncompleteEventAudit_() {
  setup('TEST');
  const marker = 'INCOMPLETE_' + Utilities.getUuid().replace(/-/g, '').slice(0, 10).toUpperCase();
  let typeId = '';
  let eventId = '';

  try {
    const typeResult = saveEventType({
      code: marker,
      name: 'Regra temporária com datas obrigatórias',
      calendarKind: 'ACADEMICO',
      startRequired: true,
      endRequired: true,
      calendarId: DEFAULT_CALENDAR_ID,
      auditYear: 2096,
      auditRule: { enabled:true, expectedQuantity:1, quantityRule:'=', periodUnit:'ANO' },
      schoolPeriod: false,
      active: true
    });
    assertTrue_(typeResult.ok, 'Falha ao criar regra temporária de evento incompleto.');
    typeId = typeResult.eventType.id;

    const partial = saveEvent({
      calendarId: DEFAULT_CALENDAR_ID,
      eventTypeId: typeId,
      title: 'Evento parcial',
      startDate: '2096-03-10',
      endDate: '',
      notes: '',
      auditYear: 2096
    });
    assertTrue_(partial.ok, 'Evento parcial deveria poder ser salvo.');
    eventId = partial.event.id;
    assertFalse_(partial.completion.complete, 'Resposta do salvamento deve indicar evento incompleto.');
    let item = partial.audit.items.find(function(row) { return row.eventTypeId === typeId; });
    assertEquals_('PARCIAL', item.status, 'Uma ocorrência incompleta deve manter a regra em estado parcial.');
    assertEquals_(0, item.checks[0].count, 'Ocorrência incompleta não deve satisfazer a quantidade exigida.');
    assertEquals_(1, item.checks[0].incompleteCount, 'Auditoria deve contabilizar explicitamente a ocorrência incompleta.');

    const completed = saveEvent({
      id: partial.event.id,
      version: partial.event.version,
      calendarId: DEFAULT_CALENDAR_ID,
      eventTypeId: typeId,
      title: 'Evento completo',
      startDate: '2096-03-10',
      endDate: '2096-03-20',
      notes: '',
      auditYear: 2096
    });
    assertTrue_(completed.ok, 'Falha ao completar evento parcial.');
    item = completed.audit.items.find(function(row) { return row.eventTypeId === typeId; });
    assertEquals_('ATENDIDA', item.status, 'Após informar a data pendente, a regra deve ficar atendida.');
    assertEquals_(1, item.checks[0].count, 'A ocorrência completa deve satisfazer a quantidade exigida.');
    assertEquals_(0, item.checks[0].incompleteCount, 'Não deve restar ocorrência incompleta.');
  } finally {
    if (eventId) forceDeleteTestEvent_(eventId);
    if (typeId) forceDeleteTestEventType_(typeId);
  }
}

function testSchoolDayTransannualModel_() {
  setup('TEST');
  const token = Utilities.getUuid().replace(/-/g, '').slice(0, 10).toUpperCase();
  const calendarId = 'CAL-TEST-' + token;
  const typeCode = 'PERIODO_TEST_' + token;
  let typeId = '';
  let eventId = '';

  appendObject_(getRequiredSheet_('CALENDARS'), {
    id: calendarId,
    title: 'Calendário temporário transanual',
    kind: 'ACADEMICO',
    status: 'RASCUNHO',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  });

  try {
    const typeResult = saveEventType({
      code: typeCode,
      name: 'Período letivo temporário',
      calendarKind: 'ACADEMICO',
      startRequired: true,
      endRequired: true,
      periodicityValue: '',
      periodicityUnit: '',
      expectedQuantity: 1,
      quantityRule: '>=',
      required: false,
      schoolPeriod: true,
      active: true
    });
    assertTrue_(typeResult.ok, 'Falha ao criar tipo temporário delimitador de malha.');
    typeId = typeResult.eventType.id;

    const eventResult = saveEvent({
      calendarId: calendarId,
      eventTypeId: typeId,
      title: 'Período transanual',
      startDate: '2097-12-28',
      endDate: '2098-01-07',
      notes: '',
      auditYear: 2097
    });
    assertTrue_(eventResult.ok, 'Falha ao criar período letivo transanual.');
    eventId = eventResult.event.id;

    const settingsResult = saveSchoolDaySettings({
      calendarId: calendarId,
      version: 0,
      monday: true, tuesday: true, wednesday: true, thursday: true,
      friday: true, saturday: true, sunday: true
    });
    assertTrue_(settingsResult.ok, 'Falha ao salvar parâmetros temporários de dias letivos.');
    const model = settingsResult.schoolDayModel;
    assertEquals_(11, model.total, 'Período transanual de 28/12 a 07/01, com todos os dias ativos, deve ter 11 dias.');
    assertEquals_(4, Number(model.byYear['2097'] || 0), 'Quatro dias devem pertencer a 2097.');
    assertEquals_(7, Number(model.byYear['2098'] || 0), 'Sete dias devem pertencer a 2098.');
    assertTrue_(model.dates.indexOf('2097-12-28') !== -1 && model.dates.indexOf('2098-01-07') !== -1,
      'A malha deve atravessar corretamente a fronteira entre anos civis.');
  } finally {
    if (eventId) forceDeleteTestEvent_(eventId);
    if (typeId) forceDeleteTestEventType_(typeId);
    forceDeleteSchoolDaySettings_(calendarId);
    forceDeleteTestCalendar_(calendarId);
  }
}

function testAuditRoundTrip_() {
  setup('TEST');
  const marker = 'AUDIT_' + Utilities.getUuid().replace(/-/g, '').slice(0, 12).toUpperCase();
  let typeId = '';
  let eventId = '';

  try {
    const typeResult = saveEventType({
      code: marker,
      name: 'Regra temporária de auditoria',
      calendarKind: 'ACADEMICO',
      startRequired: true,
      endRequired: false,
      calendarId: DEFAULT_CALENDAR_ID,
      auditYear: 2099,
      auditRule: { enabled:true, expectedQuantity:1, quantityRule:'=', periodUnit:'ANO' },
      active: true
    });
    assertTrue_(typeResult.ok, 'Falha ao criar regra temporária de auditoria.');
    typeId = typeResult.eventType.id;

    const eventResult = saveEvent({
      calendarId: DEFAULT_CALENDAR_ID,
      eventTypeId: typeId,
      title: 'Evento temporário da auditoria',
      startDate: '2099-05-10',
      endDate: '',
      notes: ''
    });
    assertTrue_(eventResult.ok, 'Falha ao criar evento para auditoria.');
    eventId = eventResult.event.id;

    let audit = getCalendarAudit(DEFAULT_CALENDAR_ID, 2099);
    let item = audit.items.find(function(row) { return row.eventTypeId === typeId; });
    assertTrue_(!!item, 'A regra temporária deveria aparecer na auditoria.');
    assertEquals_('ATENDIDA', item.status, 'A regra deveria estar atendida com uma ocorrência anual.');

    const ignored = setCalendarAuditRuleIgnored(DEFAULT_CALENDAR_ID, typeId, true, 2099);
    assertTrue_(ignored.ok, 'Falha ao ignorar regra no calendário.');
    item = ignored.audit.items.find(function(row) { return row.eventTypeId === typeId; });
    assertEquals_('IGNORADA', item.status, 'A regra deveria ficar ignorada somente no calendário.');
  } finally {
    if (eventId) forceDeleteTestEvent_(eventId);
    if (typeId) {
      forceDeleteAuditOverride_(DEFAULT_CALENDAR_ID, typeId);
      forceDeleteTestEventType_(typeId);
    }
  }
}

function testSchoolPeriodIndependentObligations_() {
  setup('TEST');
  const marker = 'PERIOD_OBL_' + Utilities.getUuid().replace(/-/g, '').slice(0, 10).toUpperCase();
  let typeId = '';
  let eventId = '';
  try {
    const typeResult = saveEventType({
      code: marker,
      name: 'Semestre letivo temporário',
      calendarKind: 'ACADEMICO',
      startRequired: true,
      endRequired: true,
      calendarId: DEFAULT_CALENDAR_ID,
      auditYear: 2095,
      auditRule: { enabled:true, expectedQuantity:1, quantityRule:'=', periodUnit:'ANO' },
      schoolPeriod: true,
      active: true
    });
    assertTrue_(typeResult.ok, 'Falha ao criar tipo temporário de período letivo.');
    typeId = typeResult.eventType.id;

    const partial = saveEvent({
      calendarId: DEFAULT_CALENDAR_ID,
      eventTypeId: typeId,
      title: 'Semestre Letivo 2095/1',
      startDate: '2095-02-01',
      endDate: '',
      notes: '',
      auditYear: 2095
    });
    assertTrue_(partial.ok, 'O período deveria poder ser salvo apenas com a data inicial.');
    eventId = partial.event.id;
    let item = partial.audit.items.find(function(row) { return row.eventTypeId === typeId; });
    assertTrue_(!!item, 'O período temporário deve aparecer na checklist.');
    assertEquals_(2, item.obligations.length, 'Um período lógico deve expor duas obrigações independentes.');
    const startObligation = item.obligations.find(function(row) { return row.role === 'START'; });
    const endObligation = item.obligations.find(function(row) { return row.role === 'END'; });
    assertEquals_('Início do Semestre Letivo 2095/1', startObligation.name, 'O marco inicial deve derivar da descrição-base.');
    assertEquals_('Fim do Semestre Letivo 2095/1', endObligation.name, 'O marco final deve derivar da descrição-base.');
    assertEquals_('ATENDIDA', startObligation.status, 'Cadastrar só o início deve atender apenas a obrigação inicial.');
    assertEquals_('PENDENTE', endObligation.status, 'Sem data final, a obrigação de fim deve permanecer pendente.');

    const completed = saveEvent({
      id: partial.event.id,
      version: partial.event.version,
      calendarId: DEFAULT_CALENDAR_ID,
      eventTypeId: typeId,
      title: 'Semestre Letivo 2095/1',
      startDate: '2095-02-01',
      endDate: '2095-06-30',
      notes: '',
      auditYear: 2095
    });
    assertTrue_(completed.ok, 'Falha ao completar o término do período.');
    item = completed.audit.items.find(function(row) { return row.eventTypeId === typeId; });
    assertTrue_(item.obligations.every(function(row) { return row.status === 'ATENDIDA'; }), 'Depois de informar início e fim, ambas as obrigações devem estar atendidas.');
    const expandedTotal = completed.audit.items.reduce(function(total, row) {
      return total + (row.obligations && row.obligations.length ? row.obligations.length : 1);
    }, 0);
    assertEquals_(expandedTotal, completed.audit.summary.total, 'O resumo da checklist deve contar início e fim do período como obrigações distintas.');

    const endOnly = saveEvent({
      id: completed.event.id,
      version: completed.event.version,
      calendarId: DEFAULT_CALENDAR_ID,
      eventTypeId: typeId,
      title: 'Semestre Letivo 2095/1',
      startDate: '',
      endDate: '2095-06-30',
      notes: '',
      auditYear: 2095
    });
    assertTrue_(endOnly.ok, 'O mesmo período também deve poder ser mantido apenas com a data final.');
    item = endOnly.audit.items.find(function(row) { return row.eventTypeId === typeId; });
    assertEquals_('PENDENTE', item.obligations.find(function(row) { return row.role === 'START'; }).status, 'Ao remover o início, apenas a obrigação inicial deve voltar a ficar pendente.');
    assertEquals_('ATENDIDA', item.obligations.find(function(row) { return row.role === 'END'; }).status, 'A obrigação final deve permanecer atendida quando somente o fim é conhecido.');
  } finally {
    if (eventId) forceDeleteTestEvent_(eventId);
    if (typeId) forceDeleteTestEventType_(typeId);
  }
}

function testHolidayValidation_() {
  let result = validateHolidayPayload_({ name: 'Natal', scope: 'NACIONAL', nature: 'FIXO', month: 12, day: 25, active: true });
  assertTrue_(result.ok, 'Um feriado fixo com dia/mês válido deve ser aceito.');
  result = validateHolidayPayload_({ name: 'Data impossível', scope: 'MUNICIPAL', nature: 'FIXO', month: 2, day: 31, active: true });
  assertFalse_(result.ok, 'Feriado fixo com data impossível deve ser rejeitado.');
  result = validateHolidayPayload_({ name: 'Carnaval', scope: 'NACIONAL', nature: 'VARIAVEL', month: '', day: '', active: true });
  assertTrue_(result.ok, 'Feriado variável não deve exigir dia/mês no cadastro-mestre.');
  assertEquals_('', result.holiday.month, 'Feriado variável não deve persistir mês fixo.');
  assertEquals_('', result.holiday.day, 'Feriado variável não deve persistir dia fixo.');
}

function testHolidayCrudAndHistory_() {
  setup('TEST');
  let holidayId = '';
  let occurrenceId = '';
  try {
    const created = saveHoliday({
      name: 'Feriado variável temporário ' + Utilities.getUuid().slice(0, 8),
      scope: 'MUNICIPAL', nature: 'VARIAVEL', active: true
    }, DEFAULT_CALENDAR_ID, 2094);
    assertTrue_(created.ok, 'Falha ao criar feriado variável temporário.');
    holidayId = created.holiday.id;
    assertEquals_('VARIAVEL', created.holiday.nature, 'A natureza variável deve ser preservada.');

    const occurrence = saveHolidayOccurrence({
      holidayId: holidayId,
      calendarId: DEFAULT_CALENDAR_ID,
      year: 2094,
      date: '2094-03-10',
      version: 0
    });
    assertTrue_(occurrence.ok, 'Falha ao registrar ocorrência anual do feriado variável.');
    occurrenceId = occurrence.occurrence.id;

    const forbiddenChange = saveHoliday({
      id: created.holiday.id,
      version: created.holiday.version,
      name: created.holiday.name,
      scope: created.holiday.scope,
      nature: 'FIXO',
      month: 3,
      day: 10,
      active: true
    }, DEFAULT_CALENDAR_ID, 2094);
    assertFalse_(forbiddenChange.ok, 'A natureza de um feriado com histórico anual não deve ser alterada.');
    assertEquals_('HISTORY_CONFLICT', forbiddenChange.code, 'A proteção do histórico deve informar conflito específico.');
  } finally {
    if (occurrenceId) forceDeleteHolidayOccurrenceById_(occurrenceId);
    if (holidayId) forceDeleteHoliday_(holidayId);
  }
}

function testFixedHolidaySubtractsSchoolDay_() {
  setup('TEST');
  const token = Utilities.getUuid().replace(/-/g, '').slice(0, 10).toUpperCase();
  const calendarId = 'CAL-HOL-' + token;
  let typeId = '';
  let eventId = '';
  let holidayId = '';
  appendTestAcademicCalendar_(calendarId, 'Calendário temporário — feriado fixo');
  try {
    const typeResult = createTestSchoolPeriodType_('HOL_PERIOD_' + token);
    assertTrue_(typeResult.ok, 'Falha ao criar delimitador temporário.');
    typeId = typeResult.eventType.id;
    const eventResult = saveEvent({
      calendarId: calendarId, eventTypeId: typeId, title: 'Semana letiva de teste',
      startDate: '2091-01-01', endDate: '2091-01-07', notes: '', auditYear: 2091
    });
    assertTrue_(eventResult.ok, 'Falha ao criar período semanal temporário.');
    eventId = eventResult.event.id;
    const settings = saveSchoolDaySettings({
      calendarId: calendarId, version: 0,
      monday: true, tuesday: true, wednesday: true, thursday: true, friday: true, saturday: true, sunday: true
    });
    assertTrue_(settings.ok, 'Falha ao configurar todos os dias como letivos no teste.');
    assertEquals_(7, settings.schoolDayModel.total, 'A semana-base de sete dias deveria contar sete antes do feriado.');

    const holiday = saveHoliday({
      name: 'Feriado fixo temporário ' + token, scope: 'NACIONAL', nature: 'FIXO', month: 1, day: 3, active: true
    }, calendarId, 2091);
    assertTrue_(holiday.ok, 'Falha ao criar feriado fixo temporário.');
    holidayId = holiday.holiday.id;
    assertEquals_(6, holiday.schoolDayModel.total, 'Um feriado fixo dentro da malha deve retirar exatamente um dia da contagem.');
    assertEquals_(1, holiday.schoolDayModel.excludedHolidayCount, 'O modelo deve explicitar um dia excluído por feriado.');
    assertTrue_(holiday.schoolDayModel.dates.indexOf('2091-01-03') === -1, 'A data do feriado não deve permanecer na malha final.');
  } finally {
    if (holidayId) forceDeleteHoliday_(holidayId);
    if (eventId) forceDeleteTestEvent_(eventId);
    if (typeId) forceDeleteTestEventType_(typeId);
    forceDeleteSchoolDaySettings_(calendarId);
    forceDeleteTestCalendar_(calendarId);
  }
}

function testOverlappingHolidaysDoNotDoubleSubtract_() {
  setup('TEST');
  const token = Utilities.getUuid().replace(/-/g, '').slice(0, 10).toUpperCase();
  const calendarId = 'CAL-HOL-OVER-' + token;
  let typeId = '';
  let eventId = '';
  const holidayIds = [];
  appendTestAcademicCalendar_(calendarId, 'Calendário temporário — feriados coincidentes');
  try {
    const typeResult = createTestSchoolPeriodType_('HOL_OVER_PERIOD_' + token);
    assertTrue_(typeResult.ok, 'Falha ao criar período para feriados coincidentes.');
    typeId = typeResult.eventType.id;
    const eventResult = saveEvent({
      calendarId: calendarId, eventTypeId: typeId, title: 'Semana com feriados coincidentes',
      startDate: '2091-01-01', endDate: '2091-01-07', notes: '', auditYear: 2091
    });
    assertTrue_(eventResult.ok, 'Falha ao criar período do teste de coincidência.');
    eventId = eventResult.event.id;
    const settings = saveSchoolDaySettings({
      calendarId: calendarId, version: 0,
      monday: true, tuesday: true, wednesday: true, thursday: true, friday: true, saturday: true, sunday: true
    });
    assertTrue_(settings.ok, 'Falha ao configurar semana do teste de coincidência.');
    ['NACIONAL', 'MUNICIPAL'].forEach(function(scope, index) {
      const result = saveHoliday({
        name: 'Feriado coincidente ' + index + ' ' + token, scope: scope, nature: 'FIXO', month: 1, day: 4, active: true
      }, calendarId, 2091);
      assertTrue_(result.ok, 'Falha ao criar feriado coincidente ' + index + '.');
      holidayIds.push(result.holiday.id);
    });
    const model = buildSchoolDayModel_(calendarId);
    assertEquals_(6, model.total, 'Dois feriados na mesma data devem retirar um único dia da malha.');
    assertEquals_(1, model.excludedHolidayCount, 'A exclusão por data deve ser deduplicada mesmo com dois feriados coincidentes.');
  } finally {
    holidayIds.forEach(forceDeleteHoliday_);
    if (eventId) forceDeleteTestEvent_(eventId);
    if (typeId) forceDeleteTestEventType_(typeId);
    forceDeleteSchoolDaySettings_(calendarId);
    forceDeleteTestCalendar_(calendarId);
  }
}

function testVariableHolidayChecklistAndOccurrence_() {
  setup('TEST');
  let holidayId = '';
  try {
    const created = saveHoliday({
      name: 'Feriado anual pendente ' + Utilities.getUuid().slice(0, 8),
      scope: 'ESTADUAL', nature: 'VARIAVEL', active: true
    }, DEFAULT_CALENDAR_ID, 2093);
    assertTrue_(created.ok, 'Falha ao criar feriado variável para checklist.');
    holidayId = created.holiday.id;
    let item = created.audit.items.find(function(row) { return row.kind === 'VARIABLE_HOLIDAY' && row.holidayId === holidayId; });
    assertTrue_(!!item, 'Feriado variável ativo deve gerar obrigação anual na checklist.');
    assertEquals_('PENDENTE', item.status, 'Sem ocorrência anual, o feriado variável deve estar pendente.');

    const wrongYear = saveHolidayOccurrence({
      holidayId: holidayId, calendarId: DEFAULT_CALENDAR_ID, year: 2093, date: '2092-12-31', version: 0
    });
    assertFalse_(wrongYear.ok, 'Uma ocorrência anual não pode receber data de outro ano.');
    assertEquals_('VALIDATION', wrongYear.code, 'Ano divergente deve ser rejeitado como validação.');

    const occurrenceResult = saveHolidayOccurrence({
      holidayId: holidayId, calendarId: DEFAULT_CALENDAR_ID, year: 2093, date: '2093-02-17', version: 0
    });
    assertTrue_(occurrenceResult.ok, 'Falha ao confirmar data anual do feriado.');
    item = occurrenceResult.audit.items.find(function(row) { return row.kind === 'VARIABLE_HOLIDAY' && row.holidayId === holidayId; });
    assertEquals_('ATENDIDA', item.status, 'Após definir a data anual, a pendência deve ficar atendida.');
    assertEquals_('2093-02-17', item.occurrence.date, 'A checklist deve apontar a ocorrência anual confirmada.');

    const removed = deleteHolidayOccurrence(holidayId, DEFAULT_CALENDAR_ID, 2093, occurrenceResult.occurrence.version);
    assertTrue_(removed.ok, 'Falha ao remover ocorrência anual temporária.');
    item = removed.audit.items.find(function(row) { return row.kind === 'VARIABLE_HOLIDAY' && row.holidayId === holidayId; });
    assertEquals_('PENDENTE', item.status, 'Ao remover a data anual, a pendência deve reaparecer.');
  } finally {
    if (holidayId) {
      forceDeleteHolidayOccurrences_(holidayId);
      forceDeleteHoliday_(holidayId);
    }
  }
}

function testSchoolDayExceptionValidation_() {
  setup('TEST');
  const token = Utilities.getUuid().replace(/-/g, '').slice(0, 10).toUpperCase();
  const calendarId = 'CAL-EXC-VAL-' + token;
  let exceptionId = '';
  let typeId = '';
  let eventId = '';
  appendTestAcademicCalendar_(calendarId, 'Calendário temporário — validação excepcional');
  try {
    const typeResult = createTestSchoolPeriodType_('EXC_VAL_PERIOD_' + token);
    assertTrue_(typeResult.ok, 'Falha ao criar período temporário.');
    typeId = typeResult.eventType.id;
    const period = saveEvent({ calendarId:calendarId,eventTypeId:typeId,title:'Período',startDate:'2091-01-01',endDate:'2091-01-07',notes:'',auditYear:2091 });
    assertTrue_(period.ok, 'Falha ao criar período temporário.');
    eventId = period.event.id;
    const settings = saveSchoolDaySettings({
      calendarId: calendarId, version: 0,
      monday: true, tuesday: true, wednesday: true, thursday: true, friday: true, saturday: false, sunday: false
    });
    assertTrue_(settings.ok, 'Falha ao salvar semana de segunda a sexta.');

    const saturday = saveSchoolDayException({
      calendarId: calendarId, date: '2091-01-06', isReplacement: false, replacedDate: '', description: 'Sábado letivo temporário', version: 0
    }, 2091);
    assertTrue_(saturday.ok, 'Sábado deve poder ser excepcional quando não está contando como letivo.');
    exceptionId = saturday.exception.id;

    const monday = saveSchoolDayException({
      calendarId: calendarId, date: '2091-01-01', isReplacement: false, replacedDate: '', description: 'Segunda indevida', version: 0
    }, 2091);
    assertFalse_(monday.ok, 'Segunda-feira já efetivamente letiva não deve poder ser cadastrada como exceção.');
    assertEquals_('NOT_EXCEPTIONAL', monday.code, 'O bloqueio deve explicar que a data já conta como letiva.');

    const conflictingSettings = saveSchoolDaySettings({
      calendarId: calendarId, version: settings.settings.version,
      monday: true, tuesday: true, wednesday: true, thursday: true, friday: true, saturday: true, sunday: false
    });
    assertFalse_(conflictingSettings.ok, 'A semana-base não pode tornar redundante um sábado excepcional já cadastrado.');
    assertEquals_('EXCEPTION_CONFLICT', conflictingSettings.code, 'A proteção deve indicar conflito com exceção existente.');

    const removed = deleteSchoolDayException(saturday.exception.id, saturday.exception.version, calendarId, 2091);
    assertTrue_(removed.ok, 'Falha ao excluir exceção temporária.');
    exceptionId = '';
    const nowAllowed = saveSchoolDaySettings({
      calendarId: calendarId, version: settings.settings.version,
      monday: true, tuesday: true, wednesday: true, thursday: true, friday: true, saturday: true, sunday: false
    });
    assertTrue_(nowAllowed.ok, 'Depois de excluir a exceção, sábado deve poder virar dia comum da semana-base.');
  } finally {
    if (exceptionId) forceDeleteSchoolDayException_(exceptionId);
    if (eventId) forceDeleteTestEvent_(eventId);
    if (typeId) forceDeleteTestEventType_(typeId);
    forceDeleteSchoolDaySettings_(calendarId);
    forceDeleteTestCalendar_(calendarId);
  }
}

function testSchoolDayExceptionCountAndReplacement_() {
  setup('TEST');
  const token = Utilities.getUuid().replace(/-/g, '').slice(0, 10).toUpperCase();
  const calendarId = 'CAL-EXC-COUNT-' + token;
  let typeId = '';
  let eventId = '';
  let exceptionId = '';
  appendTestAcademicCalendar_(calendarId, 'Calendário temporário — contagem excepcional');
  try {
    const typeResult = createTestSchoolPeriodType_('EXC_PERIOD_' + token);
    assertTrue_(typeResult.ok, 'Falha ao criar período temporário para exceção.');
    typeId = typeResult.eventType.id;
    const eventResult = saveEvent({
      calendarId: calendarId, eventTypeId: typeId, title: 'Semana letiva excepcional',
      startDate: '2091-01-01', endDate: '2091-01-07', notes: '', auditYear: 2091
    });
    assertTrue_(eventResult.ok, 'Falha ao criar período temporário.');
    eventId = eventResult.event.id;
    const settings = saveSchoolDaySettings({
      calendarId: calendarId, version: 0,
      monday: true, tuesday: true, wednesday: true, thursday: true, friday: true, saturday: false, sunday: false
    });
    assertTrue_(settings.ok, 'Falha ao configurar semana-base do teste.');
    assertEquals_(5, settings.schoolDayModel.total, 'Segunda a sexta numa semana completa deve produzir cinco dias.');

    const exception = saveSchoolDayException({
      calendarId: calendarId,
      date: '2091-01-06',
      isReplacement: true,
      replacedDate: '2091-01-03',
      description: 'Reposição personalizada pelo usuário',
      version: 0
    }, 2091);
    assertTrue_(exception.ok, 'Falha ao cadastrar sábado excepcional de reposição.');
    exceptionId = exception.exception.id;
    assertEquals_(6, exception.schoolDayModel.total, 'O dia excepcional deve acrescentar exatamente um dia à malha.');
    assertEquals_(1, exception.schoolDayModel.appliedExceptionCount, 'O modelo deve informar uma exceção positiva aplicada.');
    assertTrue_(exception.schoolDayModel.dates.indexOf('2091-01-06') !== -1, 'A data excepcional deve entrar na malha final.');
    assertTrue_(exception.schoolDayModel.dates.indexOf('2091-01-03') !== -1, 'Vincular uma reposição não deve retirar automaticamente a data original da contagem.');
    assertEquals_('2091-01-03', exception.exception.replacedDate, 'O vínculo com a data reposta deve ser preservado.');
    assertEquals_('Reposição personalizada pelo usuário', exception.exception.description, 'A descrição deve permanecer exatamente sob controle do usuário.');
  } finally {
    if (exceptionId) forceDeleteSchoolDayException_(exceptionId);
    if (eventId) forceDeleteTestEvent_(eventId);
    if (typeId) forceDeleteTestEventType_(typeId);
    forceDeleteSchoolDaySettings_(calendarId);
    forceDeleteTestCalendar_(calendarId);
  }
}

function testSchoolDayExceptionOutsidePeriod_() {
  setup('TEST');
  const token = Utilities.getUuid().replace(/-/g, '').slice(0, 10).toUpperCase();
  const calendarId = 'CAL-EXC-OUT-' + token;
  let typeId = '';
  let eventId = '';
  let exceptionId = '';
  appendTestAcademicCalendar_(calendarId, 'Calendário temporário — exceção fora de período');
  try {
    const typeResult = createTestSchoolPeriodType_('EXC_OUT_PERIOD_' + token);
    assertTrue_(typeResult.ok, 'Falha ao criar período temporário.');
    typeId = typeResult.eventType.id;
    const eventResult = saveEvent({
      calendarId: calendarId, eventTypeId: typeId, title: 'Semana curta',
      startDate: '2091-01-01', endDate: '2091-01-07', notes: '', auditYear: 2091
    });
    assertTrue_(eventResult.ok, 'Falha ao criar período temporário.');
    eventId = eventResult.event.id;
    const settings = saveSchoolDaySettings({
      calendarId: calendarId, version: 0,
      monday: true, tuesday: true, wednesday: true, thursday: true, friday: true, saturday: false, sunday: false
    });
    assertTrue_(settings.ok, 'Falha ao configurar semana-base.');
    const exception = saveSchoolDayException({
      calendarId: calendarId, date: '2091-01-13', isReplacement: false, replacedDate: '', description: 'Sábado fora do período', version: 0
    }, 2091);
    assertTrue_(exception.ok, 'Uma exceção futura pode ser cadastrada mesmo antes de o período englobá-la.');
    exceptionId = exception.exception.id;
    assertEquals_(5, exception.schoolDayModel.total, 'Exceção fora de qualquer período completo não deve aumentar a contagem atual.');
    assertTrue_(exception.schoolDayModel.pendingExceptionDates.indexOf('2091-01-13') !== -1, 'O modelo deve deixar explícito que a exceção está aguardando um período aplicável.');
  } finally {
    if (exceptionId) forceDeleteSchoolDayException_(exceptionId);
    if (eventId) forceDeleteTestEvent_(eventId);
    if (typeId) forceDeleteTestEventType_(typeId);
    forceDeleteSchoolDaySettings_(calendarId);
    forceDeleteTestCalendar_(calendarId);
  }
}


function testBeta2UiContract_() {
  const html = HtmlService.createHtmlOutputFromFile('index').getContent();
  assertTrue_(html.indexOf('id="eventTypeSchoolDayEffect"') !== -1, 'Tipos de evento devem perguntar de forma didática como afetam os dias letivos.');
  assertTrue_(html.indexOf('Não altera a contagem') !== -1 && html.indexOf('Este dia não conta como letivo') !== -1 && html.indexOf('Este dia passa a contar como letivo') !== -1, 'As três opções didáticas de efeito letivo devem estar visíveis.');
  assertTrue_(html.indexOf('id="auditSearch"') !== -1, 'Checklist da Mesa deve possuir busca no topo.');
  assertTrue_(html.indexOf("row.classList.add('actionable')") !== -1 && html.indexOf('openNewEvent(todayIso(), todayIso())') !== -1, 'Pendências acionáveis devem abrir o editor único de eventos.');
  assertTrue_(html.indexOf('function clearHolidaySelection()') !== -1 && html.indexOf('Selecione um feriado na lista') !== -1, 'CRUD de feriados deve suportar estado inicial sem seleção.');
  assertTrue_(html.indexOf('id="themesToolBtn"') !== -1 && html.indexOf('id="themesModal"') !== -1, 'Ferramenta de Temas deve existir.');
  assertTrue_(html.indexOf('id="generateThemeBtn"') !== -1 && html.indexOf('id="themePreview"') !== -1, 'Temas devem possuir geração assistida e prévia WYSIWYG.');
  assertTrue_(html.indexOf('id="duplicateThemeBtn"') !== -1, 'Tema deve poder ser duplicado.');
  assertTrue_(html.indexOf('id="livePreviewBtn"') !== -1 && html.indexOf('function openLivePreview()') !== -1, 'Live Preview deve estar sempre acessível na mesa.');
  assertTrue_(html.indexOf('Gerar PDF') !== -1, 'A Prévia deve oferecer saída em PDF.');
}

function testBeta3UiContract_() {
  const html = HtmlService.createHtmlOutputFromFile('index').getContent();
  assertTrue_(html.indexOf('id="eventTypeVisualRole"') !== -1, 'Tipo de Evento deve permitir escolher sua função visual no tema.');
  assertTrue_(html.indexOf('Cor principal') !== -1 && html.indexOf('Cor de atenção') !== -1, 'Funções visuais devem usar linguagem simples para o usuário.');
  assertTrue_(html.indexOf('id="themeHeaderText"') !== -1 && html.indexOf('Cabeçalho institucional') !== -1, 'Editor do tema deve destacar o cabeçalho institucional.');
  assertTrue_(html.indexOf('id="themeMonthsPerPage"') !== -1 && html.indexOf('<option value="12">12 meses</option>') !== -1, 'Tema deve permitir 1, 2, 4, 6 ou 12 meses por página.');
  assertTrue_(html.indexOf('Principal<input id="themeEventColor1"') !== -1 && html.indexOf('Neutra<input id="themeEventColor6"') !== -1, 'Canetas devem ter nomes didáticos em vez de números.');
  assertTrue_(html.indexOf('appliedThemeId') !== -1 && html.indexOf('editingThemeId') !== -1, 'Tema em uso e tema selecionado para edição devem ser estados distintos.');
  assertTrue_(html.indexOf("badge.textContent='Em uso'") !== -1, 'Lista de temas deve indicar explicitamente qual tema está em uso.');
  assertTrue_(html.indexOf("closeBtn.textContent='Fechar'") !== -1, 'Live Preview deve possuir botão Fechar.');
  assertTrue_(html.indexOf('Etapa 4 de 4 — Prévia pronta') !== -1 && html.indexOf('PDF: etapa 4 de 4') !== -1, 'Prévia e PDF devem exibir progresso por etapas.');
}

function testBeta4UiContract_() {
  const html = HtmlService.createHtmlOutputFromFile('index').getContent();
  assertTrue_(html.indexOf('Visualizar prévia') !== -1, 'A interface deve usar Português do Brasil no botão da prévia.');
  assertTrue_(html.indexOf('id="importNationalHolidaysBtn"') !== -1, 'CRUD de feriados deve oferecer importação nacional.');
  assertTrue_(html.indexOf('id="themeBackgroundImageField"') !== -1 && html.indexOf('Cole o link da imagem') !== -1, 'Tema com Imagem/Padrão deve exibir campo próprio para o link.');
  assertTrue_(html.indexOf('visual-role-preview-swatch') !== -1, 'A escolha da função visual deve possuir amostra de cor grande e evidente.');
  assertTrue_(html.indexOf('styleFullCalendarEventShell') !== -1 && html.indexOf("backgroundColor: 'transparent'") !== -1, 'O renderer deve neutralizar a cor padrão do FullCalendar para deixar a cor do tema aparecer.');
  assertTrue_(html.indexOf("el.calendarName.addEventListener('dblclick', startCalendarTitleEdit)") !== -1, 'Operador deve poder alterar o título do calendário por duplo clique.');
  assertTrue_(html.indexOf('school-day-legend-dot') !== -1, 'Totais de dias letivos devem reutilizar o marcador visual dos dias letivos.');
}

function testEventTypeVisualRole_() {
  setup('TEST');
  const token = Utilities.getUuid().replace(/-/g, '').slice(0, 10).toUpperCase();
  let typeId = '';
  try {
    const result = saveEventType({
      code:'ROLE_'+token, name:'Tipo visual temporário', calendarKinds:['ACADEMICO'],
      startRequired:true, endRequired:false, required:false, schoolPeriod:false,
      schoolDayEffect:'NEUTRO', visualRole:'ATENCAO', active:true
    });
    assertTrue_(result.ok, 'Tipo com função visual deve ser salvo.');
    typeId = result.eventType.id;
    assertEquals_('ATENCAO', result.eventType.visualRole, 'Função visual deve ser persistida no Tipo de Evento.');
  } finally { if (typeId) forceDeleteTestEventType_(typeId); }
}

function testEventTypeSchoolDayEffect_() {
  setup('TEST');
  const marker = 'EFFECT_' + Utilities.getUuid().replace(/-/g, '').slice(0, 10).toUpperCase();
  let typeId = '';
  try {
    const created = saveEventType({
      code: marker, name: 'Evento sem aula temporário', calendarKinds: ['ACADEMICO'],
      startRequired: true, endRequired: false, required: false, schoolPeriod: false,
      schoolDayEffect: 'NAO_LETIVO', active: true
    });
    assertTrue_(created.ok, 'Tipo com efeito não letivo deve ser salvo.');
    typeId = created.eventType.id;
    assertEquals_('NAO_LETIVO', created.eventType.schoolDayEffect, 'Efeito não letivo deve ser persistido.');
    const neutral = normalizeEventTypePayload_({ code:'TMP_X', name:'X', calendarKinds:['ACADEMICO'], schoolDayEffect:'NEUTRO' });
    assertEquals_('NEUTRO', neutral.schoolDayEffect, 'Efeito neutro deve permanecer neutro.');
  } finally { if (typeId) forceDeleteTestEventType_(typeId); }
}

function testNonSchoolEventSubtractsDay_() {
  setup('TEST');
  const token = Utilities.getUuid().replace(/-/g, '').slice(0, 8).toUpperCase();
  const calendarId = 'CAL-NON-' + token;
  let periodTypeId='', periodEventId='', nonTypeId='', nonEventId='';
  appendTestAcademicCalendar_(calendarId, 'Calendário temporário — evento sem aula');
  try {
    let r=createTestSchoolPeriodType_('PER_NON_'+token); periodTypeId=r.eventType.id;
    r=saveEvent({calendarId:calendarId,eventTypeId:periodTypeId,title:'Período',startDate:'2092-03-03',endDate:'2092-03-07',notes:'',auditYear:2092}); periodEventId=r.event.id;
    r=saveSchoolDaySettings({calendarId:calendarId,version:0,monday:true,tuesday:true,wednesday:true,thursday:true,friday:true,saturday:false,sunday:false});
    assertEquals_(5,r.schoolDayModel.total,'Período de segunda a sexta deve começar com cinco dias.');
    r=saveEventType({code:'SEM_AULA_'+token,name:'Evento sem aula',calendarKinds:['ACADEMICO'],startRequired:true,endRequired:false,required:false,schoolDayEffect:'NAO_LETIVO',active:true}); nonTypeId=r.eventType.id;
    r=saveEvent({calendarId:calendarId,eventTypeId:nonTypeId,title:'Sem aula na quarta',startDate:'2092-03-05',endDate:'',notes:'',auditYear:2092}); nonEventId=r.event.id;
    assertEquals_(4,r.schoolDayModel.total,'Evento marcado como sem aula deve retirar exatamente um dia da contagem.');
    assertTrue_(r.schoolDayModel.excludedByEventDates.indexOf('2092-03-05')!==-1,'Modelo deve indicar a data retirada por evento.');
  } finally { if(nonEventId)forceDeleteTestEvent_(nonEventId);if(nonTypeId)forceDeleteTestEventType_(nonTypeId);if(periodEventId)forceDeleteTestEvent_(periodEventId);if(periodTypeId)forceDeleteTestEventType_(periodTypeId);forceDeleteSchoolDaySettings_(calendarId);forceDeleteTestCalendar_(calendarId); }
}

function testSchoolEffectRestoresDay_() {
  setup('TEST');
  const token = Utilities.getUuid().replace(/-/g, '').slice(0, 8).toUpperCase();
  const calendarId='CAL-REST-'+token;
  let periodTypeId='',periodEventId='',nonTypeId='',nonEventId='',yesTypeId='',yesEventId='';
  appendTestAcademicCalendar_(calendarId,'Calendário temporário — restauração letiva');
  try {
    let r=createTestSchoolPeriodType_('PER_REST_'+token);periodTypeId=r.eventType.id;
    r=saveEvent({calendarId:calendarId,eventTypeId:periodTypeId,title:'Período',startDate:'2092-03-03',endDate:'2092-03-07',notes:'',auditYear:2092});periodEventId=r.event.id;
    r=saveSchoolDaySettings({calendarId:calendarId,version:0,monday:true,tuesday:true,wednesday:true,thursday:true,friday:true,saturday:false,sunday:false});
    r=saveEventType({code:'NAO_'+token,name:'Sem aula',calendarKinds:['ACADEMICO'],startRequired:true,endRequired:false,schoolDayEffect:'NAO_LETIVO',active:true});nonTypeId=r.eventType.id;
    r=saveEvent({calendarId:calendarId,eventTypeId:nonTypeId,title:'Sem aula',startDate:'2092-03-05',endDate:'',notes:'',auditYear:2092});nonEventId=r.event.id;
    assertEquals_(4,r.schoolDayModel.total,'Retirada inicial deve reduzir a quatro dias.');
    r=saveEventType({code:'SIM_'+token,name:'Volta a contar',calendarKinds:['ACADEMICO'],startRequired:true,endRequired:false,schoolDayEffect:'LETIVO',active:true});yesTypeId=r.eventType.id;
    r=saveEvent({calendarId:calendarId,eventTypeId:yesTypeId,title:'Dia letivo confirmado',startDate:'2092-03-05',endDate:'',notes:'',auditYear:2092});yesEventId=r.event.id;
    assertEquals_(5,r.schoolDayModel.total,'Marcação explícita como letiva deve restaurar a data sem depender da ordem das linhas.');
  } finally { [yesEventId,nonEventId,periodEventId].filter(Boolean).forEach(forceDeleteTestEvent_);[yesTypeId,nonTypeId,periodTypeId].filter(Boolean).forEach(forceDeleteTestEventType_);forceDeleteSchoolDaySettings_(calendarId);forceDeleteTestCalendar_(calendarId); }
}

function testExceptionAllowedOnHolidayWeekday_() {
  setup('TEST');
  const token=Utilities.getUuid().replace(/-/g,'').slice(0,8).toUpperCase();
  const calendarId='CAL-HOL-EX-'+token;
  let periodTypeId='',periodEventId='',holidayId='',exceptionId='';
  appendTestAcademicCalendar_(calendarId,'Calendário temporário — exceção em feriado');
  try {
    let r=createTestSchoolPeriodType_('PER_HE_'+token);periodTypeId=r.eventType.id;
    r=saveEvent({calendarId:calendarId,eventTypeId:periodTypeId,title:'Período',startDate:'2092-03-03',endDate:'2092-03-07',notes:'',auditYear:2092});periodEventId=r.event.id;
    r=saveSchoolDaySettings({calendarId:calendarId,version:0,monday:true,tuesday:true,wednesday:true,thursday:true,friday:true,saturday:false,sunday:false});
    r=saveHoliday({name:'Feriado temporário '+token,scope:'MUNICIPAL',nature:'FIXO',month:3,day:5,active:true},calendarId,2092);holidayId=r.holiday.id;
    assertEquals_(4,r.schoolDayModel.total,'Feriado em dia útil deve retirar o dia.');
    r=saveSchoolDayException({calendarId:calendarId,date:'2092-03-05',isReplacement:false,replacedDate:'',description:'Dia letivo excepcional em feriado',version:0},2092);
    assertTrue_(r.ok,'Dia útil tornado não letivo por feriado deve aceitar exceção letiva.');exceptionId=r.exception.id;
    assertEquals_(5,r.schoolDayModel.total,'Exceção explícita deve restaurar o dia retirado pelo feriado.');
  } finally { if(exceptionId)forceDeleteSchoolDayException_(exceptionId);if(holidayId)forceDeleteHoliday_(holidayId);if(periodEventId)forceDeleteTestEvent_(periodEventId);if(periodTypeId)forceDeleteTestEventType_(periodTypeId);forceDeleteSchoolDaySettings_(calendarId);forceDeleteTestCalendar_(calendarId); }
}

function testThemeSeedAndValidation_() {
  setup('TEST');
  const names=listThemes_(true).map(function(t){return t.name;});
  ['INSTITUCIONAL IFTM CLARO','INSTITUCIONAL IFTM ESCURO','IFTM ALTO CONTRASTE'].forEach(function(name){assertTrue_(names.indexOf(name)!==-1,'Tema inicial ausente: '+name);});
  const invalid=validateThemePayload_({name:'Sem cores'});
  assertFalse_(invalid.ok,'Tema sem cores mínimas não deve ser salvo.');
  const low=validateThemePayload_({name:'Baixo contraste',pageBg:'#ffffff',surfaceBg:'#ffffff',textColor:'#eeeeee',accentColor:'#287a3f',backgroundMode:'SOLID',backgroundValue:'#ffffff',monthEventsLayout:'SIDE_BY_SIDE',weeklyTotalsPosition:'LAST',monthlyTotalPosition:'AFTER_TABLE'});
  assertFalse_(low.ok,'Tema com texto ilegível deve ser rejeitado.');
  assertEquals_('LOW_CONTRAST',low.code,'Validação deve explicar baixo contraste.');
}

function testThemeCrudAndUniqueName_() {
  setup('TEST');
  const token=Utilities.getUuid().replace(/-/g,'').slice(0,8).toUpperCase();
  let themeId='';
  const payload={name:'TEMA TESTE '+token,pageBg:'#f4f7f4',surfaceBg:'#ffffff',textColor:'#17351f',mutedColor:'#667069',accentColor:'#287a3f',eventColors:['#287a3f','#176b87','#a96711','#7a4b92','#a63b3b','#5b6570'],headerText:'Cabeçalho',footerText:'Rodapé',logoUrl:'',backgroundMode:'SOLID',backgroundValue:'#f4f7f4',monthEventsLayout:'SIDE_BY_SIDE',monthsPerPage:4,pageOrientation:'LANDSCAPE',showWeeklyTotals:true,weeklyTotalsPosition:'LAST',monthlyTotalPosition:'AFTER_TABLE',active:true};
  try {
    let r=saveTheme(payload);assertTrue_(r.ok,'Tema válido deve ser salvo.');themeId=r.theme.id;
    const dup=saveTheme(Object.assign({},payload,{id:'',version:0,name:payload.name.toLocaleLowerCase('pt-BR')}));
    assertFalse_(dup.ok,'Nome de tema deve ser único sem diferenciar maiúsculas/minúsculas.');assertEquals_('DUPLICATE',dup.code,'Nome repetido deve gerar bloqueio claro.');
  } finally { if(themeId)forceDeleteTheme_(themeId); }
}

function testThemeDuplicateDraft_() {
  setup('TEST');
  const source=listThemes_(true)[0];
  const before=listThemes_(true).length;
  const result=duplicateThemeDraft(source.id);
  assertTrue_(result.ok,'Duplicação deve criar rascunho.');
  assertEquals_('',result.theme.id,'Cópia não deve receber ID antes de salvar.');
  assertEquals_(0,result.theme.version,'Cópia deve abrir como novo registro.');
  assertEquals_(before,listThemes_(true).length,'Duplicar não pode salvar automaticamente.');
}

function testThemeMonthsPerPage_() {
  const base = generateThemeSuggestion(1).theme;
  [1,2,4,6,12].forEach(function(count) {
    const result = validateThemePayload_(Object.assign({}, base, { name:'Página '+count, monthsPerPage:count }));
    assertTrue_(result.ok, count + ' mês(es) por página deve ser aceito.');
  });
  const invalid = validateThemePayload_(Object.assign({}, base, { name:'Página inválida', monthsPerPage:3 }));
  assertFalse_(invalid.ok, 'Quantidade de meses fora das opções definidas deve ser recusada.');
}

function testThemeRoleColorResolution_() {
  const theme = { accentColor:'#111111', eventColors:['#111111','#222222','#333333','#444444','#555555','#666666'] };
  assertEquals_('#111111', themeColorForVisualRole_(theme, 'PRINCIPAL'), 'Principal deve usar a primeira cor do tema.');
  assertEquals_('#444444', themeColorForVisualRole_(theme, 'ATENCAO'), 'Atenção deve usar sua própria cor do tema.');
  assertEquals_('#666666', themeColorForVisualRole_(theme, 'NEUTRO'), 'Neutra deve usar a sexta cor do tema.');
}

function testLivePreviewUsesTheme_() {
  setup('TEST');
  const theme=listThemes_(false).find(function(t){return t.id==='THEME-IFTM-LIGHT';})||listThemes_(false)[0];
  setCalendarTheme(DEFAULT_CALENDAR_ID,theme.id);
  const html=buildLivePreviewHtml_(DEFAULT_CALENDAR_ID,theme.id);
  assertTrue_(html.indexOf(theme.headerText)!==-1,'Live Preview deve usar cabeçalho do tema.');
  assertTrue_(html.indexOf('Total de dias letivos')!==-1,'Live Preview deve renderizar total mensal.');
  assertTrue_(html.indexOf('Eventos do mês')!==-1,'Live Preview deve trazer lista mensal de eventos.');
  assertTrue_(html.indexOf(theme.accentColor)!==-1,'Live Preview deve usar cores do tema.');
}

function testPreviewYearsFollowSchoolDayRecords_() {
  const originalCalendar=getCalendarById_,originalThemes=listThemes_,originalData=getVersionMaterializedData_;
  const theme=Object.assign({},DEFAULT_THEMES[0],{logoUrl:''});
  const period={id:'PERIOD',eventTypeId:'PERIOD',title:'Período letivo',startDate:'2027-02-01',endDate:'2027-12-15'};
  const neutral={id:'NEUTRAL',eventTypeId:'NEUTRAL',title:'Evento informativo preservado',startDate:'2027-03-01',endDate:''};
  const types=[
    {id:'PERIOD',schoolPeriod:true,schoolDayEffect:'NEUTRO',visualRole:'DESTAQUE'},
    {id:'NEUTRAL',schoolPeriod:false,schoolDayEffect:'NEUTRO',visualRole:'PRINCIPAL'},
    {id:'SCHOOL',schoolPeriod:false,schoolDayEffect:'LETIVO',visualRole:'PRINCIPAL'},
    {id:'NO_SCHOOL',schoolPeriod:false,schoolDayEffect:'NAO_LETIVO',visualRole:'ATENCAO'}
  ];
  const annualHoliday={holidayId:'VARIABLE',year:2027,date:'2027-02-09'};
  const scenarios=[
    {name:'feriado de outro ano',events:[period,neutral],occurrences:[annualHoliday,{holidayId:'VARIABLE',year:2026,date:'2026-02-17'}],years:[2027]},
    {name:'evento neutro de outro ano',events:[period,neutral,Object.assign({},neutral,{id:'OLD',startDate:'2026-12-01'})],years:[2027]},
    {name:'marcação letiva',events:[period,{eventTypeId:'SCHOOL',title:'Dia letivo',startDate:'2026-12-01',endDate:''}],years:[2026,2027]},
    {name:'marcação não letiva',events:[period,{eventTypeId:'NO_SCHOOL',title:'Dia não letivo',startDate:'2026-12-01',endDate:''}],years:[2026,2027]},
    {name:'período transanual',events:[Object.assign({},period,{startDate:'2026-12-01'})],years:[2026,2027]},
    {name:'malha letiva sem eventos',events:[],dates:['2027-02-01'],years:[2027]},
    {name:'período com apenas data final',events:[Object.assign({},period,{startDate:'',endDate:'2027-12-15'})],years:[2027]},
    {name:'sem registros de impacto letivo',events:[Object.assign({},neutral,{startDate:'2025-12-01'})],occurrences:[{holidayId:'VARIABLE',year:2025,date:'2025-03-04'}],years:[new Date().getFullYear()]}
  ];
  let data,status;
  try {
    getCalendarById_=function(){return {id:'PREVIEW-YEARS',title:'Calendário Acadêmico 2027',status:status,versionNumber:1};};
    listThemes_=function(){return [theme];};
    getVersionMaterializedData_=function(){return data;};
    scenarios.forEach(function(scenario,index){
      data={
        events:scenario.events,eventTypes:types,theme:theme,
        schoolDayModel:{dates:scenario.dates||[],byMonth:{}},schoolDayExceptions:[],
        holidayData:{holidays:[
          {id:'VARIABLE',name:'Feriado variável preservado',nature:'VARIAVEL',active:true},
          {id:'FIXED',name:'Feriado fixo preservado',nature:'FIXO',active:true,month:1,day:1}
        ],occurrences:scenario.occurrences||[annualHoliday]}
      };
      ['RASCUNHO','PUBLICADO'].forEach(function(versionStatus){
        status=versionStatus;
        ['SCREEN','PDF'].forEach(function(mode){
          const html=buildLivePreviewHtml_('PREVIEW-YEARS',theme.id,mode);
          const calendarMonths=(html.match(/<article class="month\b[\s\S]*?<\/article>/g)||[]).filter(function(month){return month.indexOf('<table>')!==-1;});
          const headings=calendarMonths.map(function(month){return month.match(/<h2>[^<]+ \d{4}<\/h2>/)[0];});
          const years=headings.map(function(heading){return Number(heading.match(/(\d{4})<\/h2>/)[1]);}).filter(function(year,i,all){return all.indexOf(year)===i;});
          const context=scenario.name+' / '+versionStatus+' / '+mode;
          assertEquals_(scenario.years.join(','),years.join(','),'Anos incorretos: '+context);
          assertEquals_(scenario.years.length*12,headings.length,'Deve gerar os 12 meses de cada ano selecionado: '+context);
          if(index===0){
            assertTrue_(html.indexOf('Evento informativo preservado')!==-1,'Eventos neutros do ano selecionado devem continuar visíveis: '+context);
            assertTrue_(html.indexOf('Feriado variável preservado')!==-1,'Feriados variáveis do ano selecionado devem continuar visíveis: '+context);
            assertTrue_(html.indexOf('Feriado fixo preservado')!==-1,'Feriados fixos devem continuar visíveis: '+context);
          }
        });
      });
    });
  } finally {
    getCalendarById_=originalCalendar;listThemes_=originalThemes;getVersionMaterializedData_=originalData;
  }
}

function testLivePreviewPagination_() {
  setup('TEST');
  const source=listThemes_(false).find(function(t){return t.id==='THEME-IFTM-LIGHT';})||listThemes_(false)[0];
  const theme=Object.assign({},source,{monthsPerPage:2});
  const validation=validateThemePayload_(theme);
  assertTrue_(validation.ok,'Tema de duas páginas deve ser válido.');
  const original=listThemes_;
  // O helper puro de colunas garante a composição usada pelo HTML/PDF.
  assertEquals_(1,previewPageColumnCount_(1),'Uma página mensal deve ter uma coluna.');
  assertEquals_(2,previewPageColumnCount_(2),'Duas páginas devem usar duas colunas.');
  assertEquals_(3,previewPageColumnCount_(6),'Seis meses devem usar três colunas.');
}

function testDarkThemeReadability_() {
  setup('TEST');
  const dark=listThemes_(true).find(function(t){return t.id==='THEME-IFTM-DARK';});
  assertTrue_(!!dark,'Tema institucional escuro deve existir.');
  assertTrue_(contrastRatio_(dark.textColor,dark.surfaceBg)>=7,'Tema escuro padrão deve manter contraste forte para o texto.');
  assertTrue_(contrastRatio_(dark.mutedColor,dark.surfaceBg)>=4.5,'Textos auxiliares do Tema escuro precisam permanecer legíveis.');
  assertEquals_(6,dark.eventColors.length,'Tema escuro deve possuir seis funções de cor.');
}

function testThemeGeneratorContrast_() {
  for(let i=0;i<15;i++){
    const result=generateThemeSuggestion(i);
    assertTrue_(result.ok,'Gerador deve produzir sugestão.');
    const validation=validateThemePayload_(Object.assign({},result.theme,{name:'Sugestão '+i}));
    assertTrue_(validation.ok,'Toda sugestão automática deve nascer legível e válida.');
    assertTrue_(contrastRatio_(result.theme.textColor,result.theme.surfaceBg)>=4.5,'Sugestão deve respeitar contraste mínimo.');
  }
}

function testThemeImageBackgroundValidation_() {
  const base=generateThemeSuggestion(2).theme;
  let result=validateThemePayload_(Object.assign({},base,{name:'Imagem sem link',backgroundMode:'IMAGE',backgroundValue:''}));
  assertFalse_(result.ok,'Tema com Imagem/Padrão deve exigir link.');
  result=validateThemePayload_(Object.assign({},base,{name:'Imagem inválida',backgroundMode:'IMAGE',backgroundValue:'arquivo-local.png'}));
  assertFalse_(result.ok,'Imagem/Padrão deve exigir endereço http/https.');
  result=validateThemePayload_(Object.assign({},base,{name:'Imagem válida',backgroundMode:'IMAGE',backgroundValue:'https://exemplo.test/fundo.png'}));
  assertTrue_(result.ok,'Link https de imagem deve ser aceito.');
}

function testDefaultInstitutionalLogoSeed_() {
  setup('TEST');
  ['THEME-IFTM-LIGHT','THEME-IFTM-DARK','THEME-IFTM-CONTRAST'].forEach(function(id){
    const theme=listThemes_(true).find(function(item){return item.id===id;});
    assertTrue_(!!theme,'Tema padrão ausente: '+id);
    assertEquals_(DEFAULT_INSTITUTIONAL_LOGO_URL,theme.logoUrl,'Tema padrão deve trazer a logo institucional cadastrada.');
  });
}

function testCalendarTitleRoundTrip_() {
  setup('TEST');
  const calendarId='CAL-TITLE-'+Utilities.getUuid().replace(/-/g,'').slice(0,10).toUpperCase();
  appendTestAcademicCalendar_(calendarId,'Calendário inicial');
  try {
    const result=saveCalendarTitle(calendarId,'CALENDÁRIO ACADÊMICO 2099 — TESTE');
    assertTrue_(result.ok,'Operador deve conseguir salvar título livre.');
    assertEquals_('CALENDÁRIO ACADÊMICO 2099 — TESTE',result.calendar.title,'Título salvo deve ser devolvido ao frontend.');
  } finally { forceDeleteTestCalendar_(calendarId); }
}

function testPreviewRendersEventColors_() {
  const theme={pageBg:'#ffffff',surfaceBg:'#ffffff',textColor:'#111111',mutedColor:'#555555',accentColor:'#117733',eventColors:['#111111','#222222','#333333','#b03a2e','#555555','#666666'],showWeeklyTotals:true,weeklyTotalsPosition:'LAST',monthlyTotalPosition:'AFTER_TABLE',monthEventsLayout:'STACKED'};
  const event={id:'E1',eventTypeId:'T1',title:'Férias acadêmicas',startDate:'2099-01-05',endDate:'2099-01-07'};
  const html=buildPreviewMonth_(2099,1,[event],{dates:[],byMonth:{}},{holidays:[],occurrences:[]},[],theme,{T1:{visualRole:'ATENCAO',schoolPeriod:false}});
  assertTrue_(html.indexOf('preview-day-event')!==-1,'Prévia deve mostrar eventos dentro da tabela do mês.');
  assertTrue_(html.indexOf('#b03a2e')!==-1,'Prévia deve usar a cor da função visual escolhida no Tipo de Evento.');
  assertTrue_(html.indexOf('Férias acadêmicas')!==-1,'Prévia deve manter o evento na composição mensal.');
  assertTrue_(html.indexOf('school-total-dot')!==-1,'Total mensal da prévia deve usar o mesmo marcador visual dos dias letivos.');
}

function testNationalHolidayImportRules_() {
  assertTrue_(!!FIXED_NATIONAL_HOLIDAY_MONTH_DAYS['01-01'],'Confraternização de 1º de janeiro deve ser reconhecida como data fixa.');
  assertTrue_(!!FIXED_NATIONAL_HOLIDAY_MONTH_DAYS['12-25'],'Natal deve ser reconhecido como data fixa.');
  assertFalse_(!!FIXED_NATIONAL_HOLIDAY_MONTH_DAYS['02-17'],'Uma data móvel não pode virar regra fixa por acidente.');
  assertEquals_('confraternizacao universal',normalizeHolidayImportKey_('  Confraternização   Universal '),'Chave de importação deve ignorar acentos e espaços extras.');
  assertTrue_(NATIONAL_HOLIDAY_API_BASE.indexOf('brasilapi.com.br/api/feriados/v1/')!==-1,'Importação nacional deve apontar para a fonte pública configurada.');
}

function appendTestAcademicCalendar_(calendarId, title) {
  appendObject_(getRequiredSheet_('CALENDARS'), {
    id: calendarId,
    title: title || 'Calendário acadêmico temporário',
    kind: 'ACADEMICO',
    status: 'RASCUNHO',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  });
}

function createTestSchoolPeriodType_(code) {
  return saveEventType({
    code: code,
    name: 'Período letivo temporário',
    calendarKind: 'ACADEMICO',
    startRequired: true,
    endRequired: true,
    periodicityValue: '',
    periodicityUnit: '',
    expectedQuantity: 1,
    quantityRule: '>=',
    required: false,
    schoolPeriod: true,
    active: true
  });
}

function forceDeleteTestEventType_(eventTypeId) {
  const ruleSheet = getRequiredSheet_('AUDIT_RULE_OVERRIDES');
  const ruleRows = readTable_(ruleSheet);
  for (let i = ruleRows.length - 1; i >= 0; i--) {
    if (String(ruleRows[i].event_type_id || '') === String(eventTypeId)) ruleSheet.deleteRow(i + 2);
  }
  const sheet = getRequiredSheet_('EVENT_TYPES');
  const rows = readTable_(sheet);
  const index = rows.findIndex(function(row) { return String(row.id || '') === String(eventTypeId); });
  if (index !== -1) sheet.deleteRow(index + 2);
}

function forceDeleteTestEvent_(eventId) {
  const sheet = getRequiredSheet_('EVENTS');
  const rows = readTable_(sheet);
  const index = rows.findIndex(function(row) { return row.id === eventId; });
  if (index !== -1) sheet.deleteRow(index + 2);
}

function forceDeleteAuditOverride_(calendarId, eventTypeId) {
  const sheet = getRequiredSheet_('AUDIT_RULE_OVERRIDES');
  const rows = readTable_(sheet);
  for (let i = rows.length - 1; i >= 0; i--) {
    if (String(rows[i].calendar_id || '') === String(calendarId) && String(rows[i].event_type_id || '') === String(eventTypeId)) {
      sheet.deleteRow(i + 2);
    }
  }
}

function forceDeleteSchoolDaySettings_(calendarId) {
  const sheet = getRequiredSheet_('SCHOOL_DAY_SETTINGS');
  const rows = readTable_(sheet);
  for (let i = rows.length - 1; i >= 0; i--) {
    if (String(rows[i].calendar_id || '') === String(calendarId)) sheet.deleteRow(i + 2);
  }
}

function forceDeleteHoliday_(holidayId) {
  const sheet = getRequiredSheet_('HOLIDAYS');
  const rows = readTable_(sheet);
  for (let i = rows.length - 1; i >= 0; i--) {
    if (String(rows[i].id || '') === String(holidayId)) sheet.deleteRow(i + 2);
  }
}

function forceDeleteHolidayOccurrenceById_(occurrenceId) {
  const sheet = getRequiredSheet_('HOLIDAY_OCCURRENCES');
  const rows = readTable_(sheet);
  for (let i = rows.length - 1; i >= 0; i--) {
    if (String(rows[i].id || '') === String(occurrenceId)) sheet.deleteRow(i + 2);
  }
}

function forceDeleteHolidayOccurrences_(holidayId) {
  const sheet = getRequiredSheet_('HOLIDAY_OCCURRENCES');
  const rows = readTable_(sheet);
  for (let i = rows.length - 1; i >= 0; i--) {
    if (String(rows[i].holiday_id || '') === String(holidayId)) sheet.deleteRow(i + 2);
  }
}

function forceDeleteSchoolDayException_(exceptionId) {
  const sheet = getRequiredSheet_('SCHOOL_DAY_EXCEPTIONS');
  const rows = readTable_(sheet);
  for (let i = rows.length - 1; i >= 0; i--) {
    if (String(rows[i].id || '') === String(exceptionId)) sheet.deleteRow(i + 2);
  }
}

function forceDeleteTheme_(themeId) {
  const sheet = getRequiredSheet_('THEMES');
  const rows = readTable_(sheet);
  for (let i = rows.length - 1; i >= 0; i--) {
    if (String(rows[i].id || '') === String(themeId)) sheet.deleteRow(i + 2);
  }
}

function forceDeleteTestCalendar_(calendarId) {
  const sheet = getRequiredSheet_('CALENDARS');
  const rows = readTable_(sheet);
  for (let i = rows.length - 1; i >= 0; i--) {
    if (String(rows[i].id || '') === String(calendarId)) sheet.deleteRow(i + 2);
  }
}

function assertTrue_(condition, message) {
  if (!condition) throw new Error(message || 'Esperado verdadeiro.');
}

function assertFalse_(condition, message) {
  if (condition) throw new Error(message || 'Esperado falso.');
}

function assertEquals_(expected, actual, message) {
  if (expected !== actual) {
    throw new Error((message || 'Valores diferentes.') + ' Esperado: ' + expected + '; obtido: ' + actual + '.');
  }
}


function testBeta5UiContract_() {
  const html = HtmlService.createHtmlOutputFromFile('index').getContent();
  assertTrue_(html.indexOf("el.calendarName.addEventListener('dblclick', startCalendarTitleEdit)") !== -1, 'O título deve entrar em edição por duplo clique.');
  assertTrue_(html.indexOf('id="editCalendarTitleBtn"') === -1, 'O botão Editar não deve permanecer visível ao lado do título.');
  assertTrue_(html.indexOf('refreshPrimaryCalendarEventsAfterTypeChange') !== -1 && html.indexOf('function replacePrimaryCalendarEvents(events)') !== -1, 'Salvar o Tipo deve sincronizar a folha pela reconstrução segura dos eventos, sem depender de API inexistente do FullCalendar.');
  assertTrue_(html.indexOf('.ca-themed-event::before') !== -1 && html.indexOf('.ca-themed-event::after') !== -1, 'Os indicadores residuais do FullCalendar devem ser neutralizados no wrapper próprio.');
  assertTrue_(html.indexOf("themeSystem: 'standard'") !== -1 && html.indexOf('palettes/purple.css') === -1, 'A mesa não deve carregar a paleta roxa Monarch que gerava artefatos persistentes.');
  assertTrue_(html.indexOf('hexToRgba(color, .22)') !== -1, 'A cor da caneta deve aparecer com presença visual maior na mesa.');
}

function testPdfColorPreservationContract_() {
  const source = String(previewCss_(DEFAULT_THEMES[0]));
  assertTrue_(source.indexOf('print-color-adjust:exact') !== -1, 'A Prévia/PDF deve solicitar preservação exata das cores.');
  assertTrue_(source.indexOf('-webkit-print-color-adjust:exact') !== -1, 'A Prévia/PDF deve incluir compatibilidade WebKit para preservar as cores.');
  const calendarId = 'TEST-CAL-PDF-COLOR-' + Utilities.getUuid();
  const typeId = 'TEST-TYPE-PDF-COLOR-' + Utilities.getUuid();
  const eventId = 'TEST-EVT-PDF-COLOR-' + Utilities.getUuid();
  appendTestAcademicCalendar_(calendarId, 'Calendário temporário — PDF com cor');
  try {
    appendObject_(getRequiredSheet_('EVENT_TYPES'), {
      id:typeId,codigo:'PDF_COR_'+Utilities.getUuid().slice(0,6).toUpperCase(),nome:'Evento colorido PDF',calendar_kind:'ACADEMICO',calendar_kinds:'ACADEMICO',
      data_inicio_obrigatoria:true,data_fim_obrigatoria:false,periodicidade_valor:'',periodicidade_unidade:'',quantidade_esperada:'',regra_quantidade:'',obrigatorio:false,
      gera_malha_letiva:false,efeito_dias_letivos:'NEUTRO',papel_visual:'ATENCAO',ativo:true,created_at:new Date().toISOString(),updated_at:new Date().toISOString(),version:1
    });
    appendObject_(getRequiredSheet_('EVENTS'), {id:eventId,calendar_id:calendarId,event_type_id:typeId,title:'Evento colorido PDF',start_date:'2094-01-10',end_date:'',notes:'',color:'',created_at:new Date().toISOString(),created_by:'test',updated_at:new Date().toISOString(),updated_by:'test',version:1});
    const html=buildLivePreviewHtml_(calendarId,'THEME-IFTM-LIGHT');
    assertTrue_(html.indexOf('background-color:#7a4b92') !== -1, 'O HTML da Prévia/PDF deve receber a cor concreta da caneta, sem depender apenas de variável CSS customizada.');
    assertTrue_(html.indexOf('print-color-adjust:exact') !== -1, 'O HTML gerado deve preservar as cores na impressão/PDF.');
  } finally {
    forceDeleteTestEvent_(eventId);
    forceDeleteTestEventType_(typeId);
    forceDeleteTestCalendar_(calendarId);
  }
}

function testThemeConflictRecoveryContract_() {
  const html = HtmlService.createHtmlOutputFromFile('index').getContent();
  assertTrue_(html.indexOf("result.code==='CONFLICT'") !== -1, 'O editor de Tema deve tratar conflito retornando à versão canônica.');
  assertTrue_(html.indexOf('Carregamos a versão mais recente para evitar perda de dados') !== -1, 'A mensagem não deve acusar outra pessoa sem evidência.');
}


function testBeta5Bg1EventTypeSaveUnlockContract_() {
  const html = HtmlService.createHtmlOutputFromFile('index').getContent();
  const start = html.indexOf('function submitEventType(event)');
  const end = html.indexOf('function confirmDeleteEventType()', start);
  assertTrue_(start !== -1 && end > start, 'O fluxo de salvar Tipo de Evento deve existir no HTML.');
  const flow = html.slice(start, end);
  const successPos = flow.indexOf('.withSuccessHandler(function(result)');
  const unlockPos = flow.indexOf('setSaving(false);', successPos);
  const localSyncPos = flow.indexOf('syncCalendarEventTypesFromAdminState()', successPos);
  const backgroundPos = flow.indexOf('window.setTimeout(function()');
  assertTrue_(successPos !== -1 && unlockPos > successPos, 'O retorno da persistência deve encerrar explicitamente a proteção global.');
  assertTrue_(localSyncPos > unlockPos, 'O catálogo local deve ser sincronizado somente depois que a aplicação já foi desbloqueada.');
  assertTrue_(backgroundPos > unlockPos, 'A sincronização completa da folha deve começar somente depois que a interface já foi desbloqueada.');
  assertTrue_(flow.indexOf('refreshPrimaryCalendarEventsAfterTypeChange(function(refreshError) {\n            setSaving(false);') === -1, 'A interface não pode depender do retorno da sincronização secundária para sair do estado bloqueado.');
}


function testBeta5Bg2ThemeCascadeContract_() {
  const html = HtmlService.createHtmlOutputFromFile('index').getContent();
  assertTrue_(html.indexOf('function applyThemeToMountedEventChips(theme)') !== -1, 'A troca de Tema deve atualizar diretamente os chips já montados na mesa.');
  assertTrue_(html.indexOf('chip.dataset.visualRole = role') !== -1, 'Cada chip precisa guardar sua função visual para poder trocar de cor sem F5.');
  assertTrue_(html.indexOf("applyThemeCascade(result.theme,'THEME_APPLY')") !== -1, 'Aplicar outro Tema deve disparar a cascata visual imediatamente.');
  assertTrue_(html.indexOf("applyThemeCascade(result.theme,'THEME_SAVE')") !== -1, 'Salvar alterações no Tema em uso deve atualizar a mesa imediatamente.');
  assertTrue_(html.indexOf('applyThemeToMountedEventChips(theme)') < html.indexOf("console.info('[ThemeCascade]'"), 'A cascata deve atualizar os chips antes de concluir seu registro de diagnóstico.');
}

function testBeta5Bg4DarkThemeApplicationContract_() {
  const html = HtmlService.createHtmlOutputFromFile('index').getContent();
  assertTrue_(html.indexOf('background: var(--surface);') !== -1, 'A barra superior deve herdar a superfície do Tema em vez de permanecer branca.');
  assertTrue_(html.indexOf('root.dataset.themeTone = dark ? \'dark\' : \'light\'') !== -1, 'A aplicação do Tema deve identificar explicitamente superfícies escuras.');
  assertTrue_(html.indexOf("root.style.setProperty('--surface-soft'") !== -1, 'Superfícies auxiliares precisam ser recalculadas conforme o Tema ativo.');
  assertTrue_(html.indexOf("root.style.setProperty('--line'") !== -1, 'Bordas precisam ganhar contraste compatível com o Tema ativo.');
  assertTrue_(html.indexOf("root.style.setProperty('--on-ink'") !== -1, 'Botões escuros/claros precisam receber texto de contraste automático.');
  assertTrue_(html.indexOf(':root[data-theme-tone="dark"] .live-preview-btn') !== -1, 'Controles críticos da mesa precisam de contrato específico de legibilidade em Tema escuro.');
}

function testDeleteImpactSnapshot_() {
  setup('TEST');
  const token = Utilities.getUuid().replace(/-/g, '').slice(0, 10).toUpperCase();
  const calendarId = 'CAL-DEL-IMPACT-' + token;
  const typeId = 'TYPE-DEL-IMPACT-' + token;
  const eventId = 'EVT-DEL-IMPACT-' + token;
  const holidayId = 'HOL-DEL-IMPACT-' + token;
  const occurrenceId = 'HOL-OCC-DEL-' + token;
  const themeId = 'THEME-DEL-IMPACT-' + token;
  appendTestAcademicCalendar_(calendarId, 'Calendário temporário — impacto de exclusão');
  try {
    appendObject_(getRequiredSheet_('EVENT_TYPES'), {
      id:typeId,codigo:'DEL_'+token,nome:'Tipo temporário para exclusão',calendar_kind:'ACADEMICO',calendar_kinds:'ACADEMICO',
      data_inicio_obrigatoria:true,data_fim_obrigatoria:false,periodicidade_valor:'',periodicidade_unidade:'',quantidade_esperada:'',regra_quantidade:'',obrigatorio:false,
      gera_malha_letiva:false,efeito_dias_letivos:'NEUTRO',papel_visual:'PRINCIPAL',ativo:true,created_at:new Date().toISOString(),updated_at:new Date().toISOString(),version:1
    });
    appendObject_(getRequiredSheet_('EVENTS'), {id:eventId,calendar_id:calendarId,event_type_id:typeId,title:'Evento dependente',start_date:'2096-04-10',end_date:'',notes:'',color:'',created_at:new Date().toISOString(),created_by:'test',updated_at:new Date().toISOString(),updated_by:'test',version:1});
    appendObject_(getRequiredSheet_('HOLIDAYS'), {id:holidayId,name:'Feriado dependente '+token,scope:'MUNICIPAL',nature:'VARIAVEL',month:'',day:'',active:true,created_at:new Date().toISOString(),updated_at:new Date().toISOString(),version:1});
    appendObject_(getRequiredSheet_('HOLIDAY_OCCURRENCES'), {id:occurrenceId,holiday_id:holidayId,calendar_id:calendarId,year:2096,date:'2096-04-11',created_at:new Date().toISOString(),created_by:'test',updated_at:new Date().toISOString(),updated_by:'test',version:1});
    const seed = listThemes_(false).find(function(t){return t.id==='THEME-IFTM-LIGHT';}) || listThemes_(false)[0];
    appendObject_(getRequiredSheet_('THEMES'), themeClientToRow_(Object.assign({}, seed, {id:themeId,name:'Tema dependente '+token,version:1,createdAt:new Date().toISOString(),updatedAt:new Date().toISOString()})));
    const calSheet=getRequiredSheet_('CALENDARS');const calRows=readTable_(calSheet);const calIndex=calRows.findIndex(function(r){return String(r.id||'')===calendarId;});
    writeObjectToRow_(calSheet,calIndex+2,Object.assign({},calRows[calIndex],{theme_id:themeId}));
    SpreadsheetApp.flush();

    const typeImpact=getDeleteImpact('EVENT_TYPE',typeId);
    assertTrue_(typeImpact.ok && typeImpact.eventCount===1 && typeImpact.calendarCount===1,'Impacto do Tipo de Evento deve contabilizar a ocorrência dependente.');
    const holidayImpact=getDeleteImpact('HOLIDAY',holidayId);
    assertTrue_(holidayImpact.ok && holidayImpact.occurrenceCount===1 && holidayImpact.calendarCount===1,'Impacto do feriado variável deve contabilizar a ocorrência anual dependente.');
    const themeImpact=getDeleteImpact('THEME',themeId);
    assertTrue_(themeImpact.ok && themeImpact.calendarCount===1 && !!themeImpact.fallbackThemeId,'Impacto do Tema deve indicar calendários afetados e um Tema substituto seguro.');
  } finally {
    forceDeleteHolidayOccurrenceById_(occurrenceId);
    forceDeleteHoliday_(holidayId);
    forceDeleteTestEvent_(eventId);
    forceDeleteTestEventType_(typeId);
    forceDeleteTheme_(themeId);
    forceDeleteTestCalendar_(calendarId);
  }
}

function testCascadeDeleteUiContract_() {
  const html = HtmlService.createHtmlOutputFromFile('index').getContent();
  assertTrue_(html.indexOf('function showCascadeDeleteConfirmation') !== -1, 'CRUDs devem usar uma confirmação visível de impacto antes da exclusão.');
  assertTrue_(html.indexOf(".getDeleteImpact('HOLIDAY', item.id)") !== -1, 'Feriados devem consultar impacto antes da exclusão.');
  assertTrue_(html.indexOf(".deleteHoliday(item.id, item.version, state.calendarRecord.id, state.holidayYear, true)") !== -1, 'Feriados devem permitir exclusão em cascata após confirmação.');
  assertTrue_(html.indexOf(".getDeleteImpact('EVENT_TYPE', item.id)") !== -1, 'Tipos de Evento devem consultar dependências antes da exclusão.');
  assertTrue_(html.indexOf('.deleteEventType(item.id, item.version, true)') !== -1, 'Tipos de Evento devem apagar suas ocorrências quando o usuário confirmar a cascata.');
  assertTrue_(html.indexOf(".getDeleteImpact('THEME',themeId)") !== -1, 'Temas devem informar calendários afetados antes da exclusão.');
  assertTrue_(html.indexOf("applyThemeCascade(result.replacementTheme,'THEME_DELETE_CASCADE')") !== -1, 'Excluir Tema em uso deve atualizar imediatamente a mesa com o Tema substituto.');
  assertTrue_(html.indexOf('Excluir em cascata') !== -1, 'A decisão final precisa pertencer explicitamente ao usuário.');
  assertTrue_(html.indexOf('Esta ação não pode ser desfeita.') !== -1, 'A confirmação deve deixar claro que a exclusão é definitiva.');
}


function testBeta5Bg5HolidayDeleteButtonStateContract_() {
  const html = HtmlService.createHtmlOutputFromFile('index').getContent();
  const start = html.indexOf('function selectHoliday(id)');
  const end = html.indexOf('function newHoliday()', start + 1);
  assertTrue_(start !== -1 && end > start, 'Fluxo selectHoliday deve existir.');
  const flow = html.slice(start, end);
  assertTrue_(flow.indexOf("el.deleteHolidayBtn.hidden = !state.holidayAccess.isSuperuser") !== -1, 'A visibilidade do botão deve continuar respeitando o perfil de superusuário.');
  assertTrue_(flow.indexOf("el.deleteHolidayBtn.disabled = !state.holidayAccess.isSuperuser") !== -1, 'Ao selecionar um feriado, o botão Excluir definitivamente deve ser explicitamente reabilitado para superusuário.');
}

function testBeta5Bg6HolidayImportRefreshAfterDeleteContract_() {
  const html = HtmlService.createHtmlOutputFromFile('index').getContent();
  const start = html.indexOf('function executeDeleteHolidayCascade(item)');
  const end = html.indexOf('function clearHolidayImportReview()', start + 1);
  assertTrue_(start !== -1 && end > start, 'Fluxo de exclusão de feriado deve existir.');
  const flow = html.slice(start, end);
  assertTrue_(flow.indexOf('clearHolidayImportReview();') !== -1, 'Após excluir um feriado, a revisão de importação precisa ser invalidada para não exibir “Já cadastrado” com estado antigo.');
}

function testBeta5Bg6HolidayImportPersistedState_() {
  const token = Utilities.getUuid().slice(0, 8);
  const holidayId = 'TEST-HOLIDAY-IMPORT-REFRESH-' + token;
  const name = 'Feriado nacional teste ' + token;
  const key = normalizeHolidayImportKey_(name);
  const source = [{ key:key, name:name, date:'2097-02-16', nature:'VARIAVEL', month:'', day:'' }];
  try {
    appendObject_(getRequiredSheet_('HOLIDAYS'), {
      id:holidayId, name:name, scope:'NACIONAL', nature:'VARIAVEL', month:'', day:'', active:true,
      created_at:new Date().toISOString(), updated_at:new Date().toISOString(), version:1
    });
    SpreadsheetApp.flush();
    let items = buildNationalHolidayImportAvailability_(source, listHolidays_(true));
    assertTrue_(items[0].alreadyExists, 'Enquanto o cadastro existe, a importação deve indicar “Já cadastrado”.');

    forceDeleteHoliday_(holidayId);
    SpreadsheetApp.flush();
    items = buildNationalHolidayImportAvailability_(source, listHolidays_(true));
    assertFalse_(items[0].alreadyExists, 'Depois da exclusão definitiva, uma nova consulta deve voltar a permitir a importação sem F5.');
  } finally {
    forceDeleteHoliday_(holidayId);
  }
}

function testBeta5Bg7NewEventEditorReadyContract_() {
  const html = HtmlService.createHtmlOutputFromFile('index').getContent();
  assertTrue_(html.indexOf('.editor-special-fields[hidden] { display:none !important; }') !== -1, 'Campos especiais irrelevantes devem permanecer realmente ocultos em um cadastro comum.');
  const helperStart = html.indexOf('function prepareNewEventEditorForInput()');
  const openStart = html.indexOf('function openNewEvent(start, end)');
  assertTrue_(helperStart !== -1 && openStart > helperStart, 'O fluxo Novo evento deve preparar explicitamente a tela para entrada.');
  const helper = html.slice(helperStart, openStart);
  assertTrue_(helper.indexOf('control.disabled = false') !== -1, 'Os controles do cadastro devem ser explicitamente habilitados ao abrir Novo evento.');
  assertTrue_(helper.indexOf("el.eventDrawer.removeAttribute('inert')") !== -1, 'O editor deve remover qualquer estado inert residual antes de receber o cadastro.');
  const next = html.indexOf('function openExistingEvent(event)', openStart);
  const flow = html.slice(openStart, next);
  assertTrue_(flow.indexOf('prepareNewEventEditorForInput()') !== -1, 'Novo evento deve executar a preparação de interatividade antes de abrir o drawer.');
  assertTrue_(flow.indexOf("setSaving(true") === -1, 'Abrir Novo evento não pode iniciar um estado de bloqueio/persistência.');
}

function testBeta5Bg8SpecialEventEditorReadyContract_() {
  const html = HtmlService.createHtmlOutputFromFile('index').getContent();
  const helperStart = html.indexOf('function prepareNewEventEditorForInput()');
  const openNewStart = html.indexOf('function openNewEvent(start, end)', helperStart);
  assertTrue_(helperStart !== -1 && openNewStart > helperStart, 'A preparação segura do Editor de Evento deve continuar disponível.');
  const helper = html.slice(helperStart, openNewStart);
  assertTrue_(helper.indexOf('control.disabled = false') !== -1, 'A preparação deve reabilitar explicitamente os controles do editor.');
  assertTrue_(helper.indexOf("el.eventDrawer.removeAttribute('inert')") !== -1, 'A preparação deve remover inert residual do drawer.');

  function assertSpecialFlowPrepared_(functionName, nextFunctionName, mode) {
    const start = html.indexOf('function ' + functionName);
    const end = html.indexOf('function ' + nextFunctionName, start + 1);
    assertTrue_(start !== -1 && end > start, 'Fluxo especial não encontrado: ' + functionName + '.');
    const flow = html.slice(start, end);
    const preparePos = flow.indexOf('prepareNewEventEditorForInput()');
    const resetPos = flow.indexOf('resetEditorSpecialState()');
    const modePos = flow.indexOf("state.editorMode = '" + mode + "'");
    assertTrue_(preparePos !== -1, functionName + ' deve reabilitar o Editor de Evento antes de abrir.');
    assertTrue_(resetPos !== -1 && preparePos < resetPos, functionName + ' deve preparar a interatividade antes de configurar o modo especial.');
    assertTrue_(modePos > resetPos, functionName + ' deve aplicar o modo especial depois da limpeza do estado anterior.');
    assertTrue_(flow.indexOf('setSaving(true') === -1, functionName + ' não pode iniciar bloqueio apenas por abrir o editor.');
  }

  assertSpecialFlowPrepared_('openVariableHolidayEvent(holidayId, year)', 'openSchoolDayExceptionEvent(exceptionId)', 'VARIABLE_HOLIDAY');
  assertSpecialFlowPrepared_('openSchoolDayExceptionEvent(exceptionId)', 'openDrawer()', 'SCHOOL_DAY_EXCEPTION');

  const rulesStart = html.indexOf('function applyEventTypeRules(');
  const rulesEnd = html.indexOf('function ', rulesStart + 20);
  const rules = html.slice(rulesStart, rulesEnd);
  assertTrue_(rules.indexOf("state.editorMode === 'VARIABLE_HOLIDAY' || state.editorMode === 'SCHOOL_DAY_EXCEPTION'") !== -1,
    'Após a reativação segura, os modos especiais devem continuar bloqueando apenas o seletor de tipo conforme a regra existente.');
}


function testBeta5Bg9UiAvailabilityContract_() {
  const html = HtmlService.createHtmlOutputFromFile('index').getContent();

  const existingStart = html.indexOf('function openExistingEvent(event)');
  const existingEnd = html.indexOf('function openVariableHolidayEvent(holidayId, year)', existingStart);
  assertTrue_(existingStart !== -1 && existingEnd > existingStart, 'Fluxo de edição de evento existente deve estar presente.');
  const existingFlow = html.slice(existingStart, existingEnd);
  assertTrue_(existingFlow.indexOf('prepareNewEventEditorForInput()') !== -1, 'Editar evento existente deve preparar explicitamente o drawer para interação.');
  assertTrue_(existingFlow.indexOf('setSaving(true') === -1, 'Abrir um evento existente não pode iniciar proteção global por si só.');

  function assertThemeDraftTransition_(functionName, nextFunctionName) {
    const start = html.indexOf('function ' + functionName);
    const end = html.indexOf('function ' + nextFunctionName, start + 1);
    assertTrue_(start !== -1 && end > start, 'Fluxo de Tema não encontrado: ' + functionName + '.');
    const flow = html.slice(start, end);
    const editorPos = flow.indexOf("setThemeCrudView('editor')");
    const enablePos = flow.indexOf('setThemeFormEnabled(true)');
    const fillPos = flow.indexOf('fillThemeForm(result.theme)');
    assertTrue_(editorPos !== -1 && enablePos > editorPos, functionName + ' deve entrar no editor e habilitar explicitamente o formulário.');
    assertTrue_(fillPos > enablePos, functionName + ' deve habilitar o formulário antes de entregar o rascunho preenchido ao usuário.');
    assertTrue_(flow.indexOf('setSaving(false)') !== -1, functionName + ' deve encerrar explicitamente a proteção global após a chamada remota.');
  }

  assertThemeDraftTransition_('generateTheme()', 'escapeHtmlClient(value)');
  assertThemeDraftTransition_('duplicateTheme()', 'deleteTheme()');
}

function testBeta5Bg9ProcessingReleaseContract_() {
  const html = HtmlService.createHtmlOutputFromFile('index').getContent();

  const auditStart = html.indexOf('function refreshAudit(renderModal, force)');
  const auditEnd = html.indexOf('function applyAuditSnapshot(', auditStart);
  assertTrue_(auditStart !== -1 && auditEnd > auditStart, 'refreshAudit deve estar presente.');
  const auditFlow = html.slice(auditStart, auditEnd);
  const firstUnlock = auditFlow.indexOf('if (renderModal) setSaving(false);');
  const firstStaleReturn = auditFlow.indexOf('if (requestId !== state.auditRequestSeq) return;');
  assertTrue_(firstUnlock !== -1 && firstUnlock < firstStaleReturn, 'Auditoria deve liberar a proteção antes de descartar um snapshot obsoleto.');
  const secondUnlock = auditFlow.indexOf('if (renderModal) setSaving(false);', firstUnlock + 1);
  const secondStaleReturn = auditFlow.indexOf('if (requestId !== state.auditRequestSeq) return;', firstStaleReturn + 1);
  assertTrue_(secondUnlock !== -1 && secondUnlock < secondStaleReturn, 'Falha obsoleta da Auditoria também deve liberar a proteção antes do return.');

  const previewStart = html.indexOf('function openLivePreview()');
  const previewEnd = html.indexOf('function setSaving(active, message)', previewStart);
  assertTrue_(previewStart !== -1 && previewEnd > previewStart, 'Fluxo de Prévia/PDF deve estar presente.');
  const previewFlow = html.slice(previewStart, previewEnd);
  assertTrue_(previewFlow.indexOf('setSaving(false)') !== -1, 'Prévia deve encerrar explicitamente a proteção global quando a chamada remota termina.');
  assertTrue_(previewFlow.indexOf('finally {\n                previewActions.forEach(function(btn){btn.disabled=false;});') !== -1, 'Geração do PDF deve sempre reabilitar os botões da janela de prévia, mesmo se o download falhar no cliente.');
}

function testBeta5Bg10GlobalUnlockContract_() {
  const html = HtmlService.createHtmlOutputFromFile('index').getContent();

  const helperStart = html.indexOf('function setApplicationInteractionBlocked(active)');
  const helperEnd = html.indexOf('function setSaving(active, message)', helperStart);
  assertTrue_(helperStart !== -1 && helperEnd > helperStart, 'Deve existir helper único para aplicar/remover a proteção global.');
  const helper = html.slice(helperStart, helperEnd);

  assertTrue_(helper.indexOf('el.appRoot.inert = true;') !== -1, 'Proteção global deve usar inert durante processamento.');
  assertTrue_(helper.indexOf("el.appRoot.setAttribute('inert', '')") !== -1, 'Ativação deve ser explícita também no atributo inert.');
  assertTrue_(helper.indexOf('el.appRoot.inert = false;') !== -1, 'Liberação deve desligar a propriedade inert.');
  assertTrue_(helper.indexOf("el.appRoot.removeAttribute('inert')") !== -1, 'Liberação deve remover defensivamente o atributo inert residual.');
  assertTrue_(helper.indexOf("el.appRoot.removeAttribute('aria-busy')") !== -1, 'Liberação deve retirar aria-busy do appRoot.');
  assertTrue_(helper.indexOf('el.operationShield.hidden = true;') !== -1, 'Liberação deve ocultar o shield.');
  assertTrue_(helper.indexOf("el.operationShield.setAttribute('hidden', '')") !== -1, 'Liberação deve reforçar o estado hidden do shield.');

  const savingStart = html.indexOf('function setSaving(active, message)');
  const savingEnd = html.indexOf('function showFeedback(', savingStart);
  const saving = html.slice(savingStart, savingEnd);
  assertTrue_(saving.indexOf('setApplicationInteractionBlocked(state.saving);') !== -1, 'setSaving deve delegar a proteção global ao helper simétrico.');
}

function testBeta5Bg10PostProcessingOrderContract_() {
  const html = HtmlService.createHtmlOutputFromFile('index').getContent();

  function assertUnlockBeforeThemeEditor_(functionName, nextFunctionName) {
    const start = html.indexOf('function ' + functionName);
    const end = html.indexOf('function ' + nextFunctionName, start + 1);
    assertTrue_(start !== -1 && end > start, 'Fluxo não encontrado: ' + functionName + '.');
    const flow = html.slice(start, end);
    const successPos = flow.indexOf('.withSuccessHandler(function(result)');
    const unlockPos = flow.indexOf('setSaving(false)', successPos);
    const editorPos = flow.indexOf("setThemeCrudView('editor')", successPos);
    const enablePos = flow.indexOf('setThemeFormEnabled(true)', successPos);
    const fillPos = flow.indexOf('fillThemeForm(result.theme)', successPos);
    assertTrue_(successPos !== -1 && unlockPos > successPos, functionName + ' deve liberar o processamento no início do success handler.');
    assertTrue_(editorPos > unlockPos, functionName + ' só pode abrir o editor depois da liberação global.');
    assertTrue_(enablePos > unlockPos && fillPos > enablePos, functionName + ' deve entregar o formulário habilitado depois do appRoot desbloqueado.');
  }

  assertUnlockBeforeThemeEditor_('generateTheme()', 'escapeHtmlClient(value)');
  assertUnlockBeforeThemeEditor_('duplicateTheme()', 'deleteTheme()');

  const previewStart = html.indexOf('function openLivePreview()');
  const previewEnd = html.indexOf('function setApplicationInteractionBlocked(active)', previewStart);
  assertTrue_(previewStart !== -1 && previewEnd > previewStart, 'Fluxo de Prévia/PDF deve estar presente.');
  const preview = html.slice(previewStart, previewEnd);
  const previewSuccess = preview.indexOf('.withSuccessHandler(function(html)');
  const previewUnlock = preview.indexOf('setSaving(false)', previewSuccess);
  const previewRender = preview.indexOf('previewWindow.document.open()', previewSuccess);
  assertTrue_(previewUnlock > previewSuccess && previewRender > previewUnlock, 'Prévia deve liberar a mesa principal antes de renderizar a janela recebida.');

  const pdfSuccess = preview.indexOf('.withSuccessHandler(function(result)', previewSuccess);
  const pdfUnlock = preview.indexOf('setSaving(false)', pdfSuccess);
  const pdfDecode = preview.indexOf('atob(result.base64)', pdfSuccess);
  assertTrue_(pdfUnlock > pdfSuccess && pdfDecode > pdfUnlock, 'PDF deve liberar a mesa principal quando o servidor termina, antes do processamento local do arquivo.');

  const eventTypeStart = html.indexOf('function submitEventType(event)');
  const eventTypeEnd = html.indexOf('function confirmDeleteEventType()', eventTypeStart);
  const eventTypeFlow = html.slice(eventTypeStart, eventTypeEnd);
  const eventSuccess = eventTypeFlow.indexOf('.withSuccessHandler(function(result)');
  const eventUnlock = eventTypeFlow.indexOf('setSaving(false)', eventSuccess);
  const eventLocalUpdate = eventTypeFlow.indexOf('state.eventTypes.findIndex', eventSuccess);
  assertTrue_(eventUnlock > eventSuccess && eventLocalUpdate > eventUnlock, 'Tipo de Evento deve liberar a proteção assim que a persistência termina, antes da atualização visual local.');
}


function testPv25HolidayOccurrenceLastAuthorizedWriteWins_() {
  setup('TEST');
  let holidayId='';
  try {
    const created=saveHoliday({name:'PV25 Carnaval '+Utilities.getUuid().slice(0,8),scope:'NACIONAL',nature:'VARIAVEL',active:true},DEFAULT_CALENDAR_ID,2094);
    assertTrue_(created.ok,'Pré-condição: feriado variável deve ser criado.');
    holidayId=created.holiday.id;
    const first=saveHolidayOccurrence({holidayId:holidayId,calendarId:DEFAULT_CALENDAR_ID,year:2094,date:'2094-02-10',version:0});
    assertTrue_(first.ok&&first.occurrence.version>=1,'Primeira ocorrência deve ser gravada.');
    const stale=saveHolidayOccurrence({holidayId:holidayId,calendarId:DEFAULT_CALENDAR_ID,year:2094,date:'2094-02-11',version:0});
    assertTrue_(stale.ok,'Versão cliente obsoleta não deve bloquear uma nova gravação autorizada.');
    assertEquals_('2094-02-11',stale.occurrence.date,'Última gravação autorizada deve vencer.');
    assertTrue_(stale.occurrence.version>first.occurrence.version,'Versão interna ainda deve avançar para auditoria/rastreabilidade.');
  } finally {
    if(holidayId){forceDeleteHolidayOccurrences_(holidayId);forceDeleteHoliday_(holidayId);}
  }
}

function testPv25HolidayChecklistFreshOccurrenceContract_() {
  const html=HtmlService.createHtmlOutputFromFile('index').getContent();
  assertTrue_(html.indexOf('openVariableHolidayEvent(item.holidayId, year, item.occurrence || null)')!==-1,'Checklist deve entregar seu próprio snapshot atual da ocorrência ao editor.');
  assertTrue_(html.indexOf('occurrenceSnapshot && occurrenceSnapshot.holidayId === holidayId')!==-1,'Editor deve priorizar a ocorrência recebida pelo checklist.');
  assertTrue_(html.indexOf('state.editorSpecialVersion = Number(result.occurrence.version || 0)')!==-1,'Após salvar, editor deve sincronizar a versão canônica retornada.');
  const backend=String(saveHolidayOccurrence);
  assertFalse_(backend.indexOf('A ocorrência anual foi alterada por outra pessoa.')!==-1,'Salvar ocorrência anual não deve emitir conflito falso por versão cliente obsoleta.');
  assertTrue_(backend.indexOf('lock.waitLock(7000)')!==-1 && backend.indexOf('calendarVersionMutationFailure_(calendar)')!==-1,'Upsert anual deve reler e validar a versão do calendário dentro do ScriptLock.');
}

function testPv25EventDrawerCompletionContract_() {
  const html=HtmlService.createHtmlOutputFromFile('index').getContent();
  const submitStart=html.indexOf('function submitEvent(event)');
  const submitEnd=html.indexOf('function submitVariableHolidayFromEditor()',submitStart);
  const flow=html.slice(submitStart,submitEnd);
  assertTrue_(flow.indexOf('scheduleDrawerCloseAfterSave(900)')!==-1,'Sucesso de evento único deve encerrar automaticamente o drawer.');
  assertTrue_(flow.indexOf('scheduleDrawerCloseAfterSave(1500)')!==-1,'Warning de evento salvo também deve encerrar o ciclo visual, com tempo maior para leitura.');
  assertTrue_(html.indexOf("if (el.eventDrawer.classList.contains('open') && !state.saving) closeDrawer()")!==-1,'Timer de conclusão não pode fechar o drawer enquanto processamento estiver ativo.');
  assertTrue_(html.indexOf("updateContextFeedback(el.drawerFeedback,'error','Falha ao salvar o evento'")!==-1,'Erro deve continuar no drawer sem fechamento automático.');
}

function testPv25BatchEventUiContract_() {
  const html=HtmlService.createHtmlOutputFromFile('index').getContent();
  ['eventEntryMode','singleEventModeBtn','batchEventModeBtn','batchOccurrences','batchDateGrid','batchOccurrenceList','batchOccurrenceCount'].forEach(function(id){
    assertTrue_(html.indexOf('id="'+id+'"')!==-1,'Cadastro em lote deve possuir controle '+id+'.');
  });
  assertTrue_(html.indexOf('Evento único')!==-1 && html.indexOf('Várias ocorrências')!==-1,'Evento único deve permanecer como fluxo padrão e lote ser opção explícita.');
  assertTrue_(html.indexOf("state.eventEntryMode = 'SINGLE'")!==-1,'Novo editor deve iniciar no modo Evento único.');
  assertTrue_(html.indexOf("state.eventEntryMode === 'BATCH' && canUseBatchEventMode()")!==-1,'Somente a opção de várias ocorrências deve desviar para o salvamento em lote.');
  assertTrue_(html.indexOf('Cada data será salva como um evento independente.')!==-1,'UI deve explicar que não há série/recorrência persistente.');
  assertTrue_(html.indexOf('+ adicionar término')!==-1,'Cada ocorrência deve permitir término opcional sem repetir o formulário completo.');
  assertTrue_(html.indexOf("('Salvar ' + count + (count === 1 ? ' evento' : ' eventos'))")!==-1,'Botão deve informar quantos eventos serão gravados.');
}

function testPv25BatchEventAtomicRoundTrip_() {
  setup('TEST');
  const calendarId='CAL-PV25-BATCH-'+Utilities.getUuid().replace(/-/g,'').slice(0,8);
  const eventIds=[];
  try {
    appendTestAcademicCalendar_(calendarId,'Cadastro em lote PV25');
    const type=listEventTypesForCalendarKind_('ACADEMICO',true).find(function(item){return item.code==='EVENTOS_DIVERSOS';}) || listEventTypesForCalendarKind_('ACADEMICO',true)[0];
    assertTrue_(!!type,'Cadastro em lote requer um Tipo de Evento acadêmico ativo.');
    const before=readTable_(getRequiredSheet_('EVENTS')).filter(function(row){return String(row.calendar_id||'')===calendarId;}).length;
    const result=saveEventsBatch({
      calendarId:calendarId,eventTypeId:type.id,title:'Reunião Conselho Gestor',notes:'PV25',
      auditYear:2095,
      occurrences:[
        {startDate:'2095-02-27',endDate:''},
        {startDate:'2095-04-30',endDate:''},
        {startDate:'2095-08-28',endDate:'2095-08-29'}
      ]
    });
    assertTrue_(result.ok,'Lote válido deve ser gravado.');
    assertEquals_(3,result.events.length,'Cada data selecionada deve produzir um EVENT independente.');
    result.events.forEach(function(item){eventIds.push(item.id);});
    assertEquals_(3,new Set(result.events.map(function(item){return item.id;})).size,'Eventos do lote devem receber IDs próprios.');
    const after=readTable_(getRequiredSheet_('EVENTS')).filter(function(row){return String(row.calendar_id||'')===calendarId;}).length;
    assertEquals_(before+3,after,'Uma única operação deve persistir todas as ocorrências validadas.');

    const duplicate=saveEventsBatch({
      calendarId:calendarId,eventTypeId:type.id,title:'Duplicado acidental',auditYear:2095,
      occurrences:[{startDate:'2095-09-01',endDate:''},{startDate:'2095-09-01',endDate:''}]
    });
    assertFalse_(duplicate.ok,'Datas idênticas dentro do mesmo lote devem ser rejeitadas antes da escrita.');
    assertEquals_('DUPLICATE_BATCH_OCCURRENCE',duplicate.code,'Duplicidade do lote deve ter código semântico próprio.');
    const unchanged=readTable_(getRequiredSheet_('EVENTS')).filter(function(row){return String(row.calendar_id||'')===calendarId;}).length;
    assertEquals_(after,unchanged,'Lote inválido não pode gerar escrita parcial.');

    const source=String(saveEventsBatch);
    assertTrue_(source.indexOf('.setValues(matrix)')!==-1,'Lote deve usar uma única escrita matricial depois das validações.');
    assertFalse_(source.indexOf('recurrence_id')!==-1 || source.indexOf('series_id')!==-1,'Cadastro em lote não deve criar vínculo de recorrência/série.');
  } finally {
    eventIds.forEach(forceDeleteTestEvent_);
    forceDeleteTestCalendar_(calendarId);
  }
}


/** PV28 — BUG-081: Dia do Servidor Público é variável no catálogo-base. */
function testPv28ServidorPublicoSeedContract_() {
  setup('TEST');
  const definition = DEFAULT_SUPPLEMENTARY_HOLIDAYS.find(function(item){ return normalizeHolidayImportKey_(item.name) === normalizeHolidayImportKey_('Dia do Servidor Público'); });
  assertTrue_(!!definition, 'Dia do Servidor Público deve fazer parte do seed complementar.');
  assertEquals_('NACIONAL', definition.scope, 'Dia do Servidor Público deve ser cadastrado no catálogo nacional.');
  assertEquals_('VARIAVEL', definition.nature, 'Dia do Servidor Público não pode receber data fixa no catálogo-base.');
  assertEquals_('', definition.month, 'Feriado variável não deve possuir mês fixo.');
  assertEquals_('', definition.day, 'Feriado variável não deve possuir dia fixo.');
  assertTrue_(String(seedSupplementaryHolidayCatalog_).indexOf('holidaySeedMatches_') !== -1, 'Seed complementar deve ser idempotente e evitar duplicidade por nome normalizado.');
  const rows=readTable_(getRequiredSheet_('HOLIDAYS')).filter(function(row){
    return String(row.scope||'').toUpperCase()==='NACIONAL' && normalizeHolidayImportKey_(row.name)===normalizeHolidayImportKey_('Dia do Servidor Público');
  });
  assertEquals_(1,rows.length,'Setup deve terminar com um único Dia do Servidor Público no catálogo nacional.');
  assertEquals_('VARIAVEL',String(rows[0].nature||'').toUpperCase(),'Registro persistido deve ser variável.');
  assertEquals_('',String(rows[0].month||''),'Registro persistido variável não pode manter mês fixo legado.');
  assertEquals_('',String(rows[0].day||''),'Registro persistido variável não pode manter dia fixo legado.');
}

/** PV28 — REGRA-084: obrigação da checklist pertence ao Projeto/versão. */
function testPv28ProjectScopedChecklistRuleContract_() {
  setup('TEST');
  const token=Utilities.getUuid().replace(/-/g,'').slice(0,10).toUpperCase();
  const calendarId='CAL-PV28-RULE-'+token;
  let typeId='';
  appendTestAcademicCalendar_(calendarId,'Calendário temporário — regra contextual PV28');
  try {
    const created=saveEventType({
      code:'PV28_RULE_'+token,name:'Categoria contextual PV28',calendarKinds:['ACADEMICO'],
      startRequired:true,endRequired:false,schoolPeriod:false,schoolDayEffect:'NEUTRO',visualRole:'PRINCIPAL',active:true,
      calendarId:calendarId,auditYear:2094,
      auditRule:{enabled:true,expectedQuantity:1,quantityRule:'=',periodUnit:'SEMESTRE'}
    });
    assertTrue_(created.ok,'Tipo + regra contextual deveriam ser salvos.');
    typeId=created.eventType.id;
    assertFalse_(created.eventType.required,'Tipo global não deve carregar obrigatoriedade depois do PV28.');
    assertEquals_('',created.eventType.periodicityUnit,'Periodicidade não deve permanecer como propriedade ativa do Tipo.');
    assertTrue_(created.auditRule && created.auditRule.enabled,'Regra deve ficar habilitada somente no calendário informado.');
    assertEquals_('SEMESTRE',created.auditRule.periodUnit,'Intervalo de verificação deve pertencer à regra contextual.');
    const scoped=getCalendarAudit(calendarId,2094).items.find(function(item){return item.eventTypeId===typeId;});
    assertTrue_(!!scoped,'Categoria habilitada deve aparecer na checklist do Projeto correspondente.');
    const other=getCalendarAudit(DEFAULT_CALENDAR_ID,2094).items.find(function(item){return item.eventTypeId===typeId;});
    assertFalse_(!!other,'A mesma categoria não pode virar obrigação em outro Projeto sem configuração explícita.');
  } finally {
    if(typeId){forceDeleteAuditOverride_(calendarId,typeId);forceDeleteTestEventType_(typeId);}
    forceDeleteTestCalendar_(calendarId);
  }
}

/** PV28 — migração preserva regra antiga antes de limpar EVENT_TYPES. */
function testPv28LegacyRuleMigrationContract_() {
  setup('TEST');
  const token=Utilities.getUuid().replace(/-/g,'').slice(0,10).toUpperCase();
  const calendarId='CAL-PV28-MIG-'+token;
  const typeId='TYPE-PV28-MIG-'+token;
  appendTestAcademicCalendar_(calendarId,'Calendário temporário — migração de regra PV28');
  try {
    appendObject_(getRequiredSheet_('EVENT_TYPES'), {
      id:typeId,codigo:'PV28_MIG_'+token,nome:'Regra legada temporária',calendar_kind:'ACADEMICO',calendar_kinds:'ACADEMICO',
      data_inicio_obrigatoria:true,data_fim_obrigatoria:false,periodicidade_valor:1,periodicidade_unidade:'SEMESTRE',
      quantidade_esperada:2,regra_quantidade:'>=',obrigatorio:true,gera_malha_letiva:false,efeito_dias_letivos:'NEUTRO',papel_visual:'PRINCIPAL',ativo:true,
      created_at:new Date().toISOString(),updated_at:new Date().toISOString(),version:1
    });
    const migrated=migrateLegacyAuditRuleConfigurations_(getDatabase_());
    assertTrue_(migrated>=1,'Migração deve criar ao menos a regra contextual do tipo legado temporário.');
    clearLegacyEventTypeAuditFields_(getDatabase_());
    const rule=getCalendarAuditRuleMap_(calendarId)[typeId];
    assertTrue_(!!rule && rule.enabled,'Regra antiga deve sobreviver como configuração da versão.');
    assertEquals_(2,rule.expectedQuantity,'Quantidade da regra antiga deve ser preservada.');
    assertEquals_('>=',rule.quantityRule,'Operador da regra antiga deve ser preservado.');
    assertEquals_('SEMESTRE',rule.periodUnit,'Intervalo da regra antiga deve ser preservado.');
    const row=readTable_(getRequiredSheet_('EVENT_TYPES')).find(function(item){return String(item.id||'')===typeId;});
    assertFalse_(toBoolean_(row.obrigatorio),'Catálogo global deve deixar de carregar obrigatoriedade após a migração.');
    assertEquals_('',String(row.periodicidade_unidade||''),'Catálogo global deve deixar de carregar periodicidade após a migração.');
  } finally {
    forceDeleteTestEventType_(typeId);
    forceDeleteTestCalendar_(calendarId);
  }
}

/** PV28 — cadastro do Tipo deixa de ter periodicidade/obrigatoriedade global redundante. */
function testPv28EventTypeRuleUiSimplificationContract_() {
  const html=HtmlService.createHtmlOutputFromFile('index').getContent();
  assertFalse_(html.indexOf('id="eventTypePeriodicityValue"')!==-1 || html.indexOf('id="eventTypePeriodicityUnit"')!==-1,'Campos de periodicidade separados devem ser removidos do cadastro do Tipo.');
  assertFalse_(html.indexOf('id="eventTypeRequired"')!==-1,'Obrigatoriedade global não deve continuar no catálogo de Tipos.');
  assertTrue_(html.indexOf('id="eventTypeChecklistEnabled"')!==-1 && html.indexOf('id="eventTypeRulePeriodUnit"')!==-1,'Regra opcional da checklist deve aparecer como configuração contextual do Projeto.');
  const save=String(saveEventType);
  assertTrue_(save.indexOf("periodicidade_valor: ''")!==-1 && save.indexOf('obrigatorio: false')!==-1,'Salvar Tipo novo/editado deve retirar a regra do catálogo global.');
  assertTrue_(String(clearLegacyEventTypeAuditFields_).indexOf("periodicidade_valor: ''")!==-1 && String(clearLegacyEventTypeAuditFields_).indexOf('obrigatorio: false')!==-1,'Atualização deve limpar os campos globais somente depois de migrar as regras antigas para cada versão.');
  assertTrue_(String(runSetupMenuStep_).indexOf('migrateLegacyAuditRuleConfigurations_(ss),legacyAuditFields=clearLegacyEventTypeAuditFields_(ss),eventAdded=seedDefaultEventTypes_(ss)')!==-1,'Setup deve preservar regras legadas no Projeto antes de limpar o catálogo global.');
  assertTrue_(String(buildCalendarAudit_).indexOf('getCalendarAuditRuleMap_')!==-1,'Checklist deve consultar regras da versão, não obrigatorio do EVENT_TYPES.');
}

/** PV28 — PERF-082: abrir checklist limpa reutiliza snapshot local. */
function testPv28AuditCacheContract_() {
  const html=HtmlService.createHtmlOutputFromFile('index').getContent();
  const openStart=html.indexOf('function openAuditModal()');
  const openEnd=html.indexOf('function closeAuditModal()',openStart);
  const open=html.slice(openStart,openEnd);
  assertTrue_(open.indexOf('const reusable = !!(state.audit && !state.auditDirty')!==-1,'Abertura deve testar se o snapshot local ainda é reutilizável.');
  assertTrue_(open.indexOf('renderAudit();')!==-1,'Checklist limpa deve renderizar imediatamente do estado local.');
  assertTrue_(open.indexOf('refreshAudit(true, true)')!==-1,'Backend só deve ser chamado no ramo em que o snapshot está sujo/ausente.');
  const refreshStart=html.indexOf('function refreshAudit(renderModal, force)');
  const refreshEnd=html.indexOf('function applyAuditSnapshot',refreshStart);
  const refresh=html.slice(refreshStart,refreshEnd);
  assertTrue_(refresh.indexOf("if (!force && state.audit && !state.auditDirty")!==-1,'refreshAudit deve evitar chamada remota redundante.');
  assertTrue_(html.indexOf("state.auditDirty = false;\n              updateAuditSummary();")!==-1,'Bootstrap deve aproveitar a auditoria já materializada em vez de recalculá-la ao abrir.');
}

/** PV28 — REGRA-085: Novo Evento mostra pendências e eventos existentes sem nova chamada remota. */
function testPv28EventChecklistContextContract_() {
  const html=HtmlService.createHtmlOutputFromFile('index').getContent();
  assertTrue_(html.indexOf('id="eventChecklistContext"')!==-1,'Drawer deve reservar contexto para checklist e registros existentes.');
  const start=html.indexOf('function renderEventChecklistContext()');
  const end=html.indexOf('function applyEventTypeRules',start);
  const flow=html.slice(start,end);
  assertTrue_(flow.indexOf('state.audit.items.find')!==-1,'Contexto deve reutilizar a checklist já carregada.');
  assertTrue_(flow.indexOf('state.calendar.getEvents()')!==-1,'Contexto deve mostrar registros já existentes da mesma categoria.');
  assertTrue_(flow.indexOf('openExistingEventByLogicalId')!==-1,'Usuário deve poder retomar uma tarefa/registro existente diretamente.');
  assertFalse_(flow.indexOf('google.script.run')!==-1,'Selecionar a categoria não deve regenerar a checklist no backend.');
  assertTrue_(flow.indexOf('Continuar tarefa:')!==-1 && flow.indexOf('Abrir existente:')!==-1,'Painel deve diferenciar conclusão de pendência e consulta de registro existente.');
  assertTrue_(flow.indexOf('event-checklist-obligations')!==-1 && flow.indexOf('item.checks.filter')!==-1,'Painel deve explicitar quais intervalos/marcos continuam pendentes ou parciais, sem exigir memória do usuário.');
}

/** PV28 — BUG-083: sincronização de Tipos não usa API inexistente rerenderEvents. */
function testPv28EventTypeFullCalendarCompatibilityContract_() {
  const html=HtmlService.createHtmlOutputFromFile('index').getContent();
  const start=html.indexOf('function submitEventType(event)');
  const end=html.indexOf('function confirmDeleteEventType()',start);
  const flow=html.slice(start,end);
  assertFalse_(flow.indexOf('state.calendar.rerenderEvents()')!==-1,'Salvar Tipo não pode chamar rerenderEvents diretamente.');
  assertTrue_(flow.indexOf('refreshPrimaryCalendarEventsAfterTypeChange')!==-1,'Após salvar, eventos devem ser reconstruídos pelo caminho compatível existente.');
  assertTrue_(flow.indexOf('result.auditRuleTouched')!==-1,'Salvar apenas a categoria global em versão congelada não pode apagar a regra histórica local nem invalidar a checklist.');
  assertTrue_(String(saveEventType).indexOf('auditRuleTouched:hasAuditRule')!==-1,'Backend deve informar explicitamente se a regra contextual foi realmente alterada.');
  const replaceStart=html.indexOf('function replacePrimaryCalendarEvents(events)');
  const replaceEnd=html.indexOf('function refreshPrimaryCalendarEventsAfterTypeChange',replaceStart);
  assertFalse_(html.slice(replaceStart,replaceEnd).indexOf('rerenderEvents()')!==-1,'Reconstrução primária deve depender de remove/addEvent, que já redesenha no FullCalendar v7.');
}

function testUx1ModalArchitectureContract_() {
  const html=HtmlService.createHtmlOutputFromFile('index').getContent();
  assertTrue_(html.indexOf('UX01_MODAL_ARCHITECTURE')!==-1,'Ciclo UX1 deve registrar a arquitetura visual dos modais.');
  assertTrue_(html.indexOf('width: min(880px, calc(100vw - 40px))')!==-1,'Modal padrão deve ter largura contida e preservar a mesa ao fundo.');
  assertTrue_(html.indexOf('backdrop-filter: blur(2px)')!==-1,'Backdrop deve ser leve, sem apagar totalmente a mesa.');
}

function testUx2EventTypeFocusedCrudContract_() {
  const html=HtmlService.createHtmlOutputFromFile('index').getContent();
  assertTrue_(html.indexOf('UX02_EVENT_TYPES_FOCUSED_CRUD')!==-1,'Tipos de Evento devem usar CRUD focado.');
  assertTrue_(html.indexOf('function setEventTypeCrudView(mode)')!==-1,'CRUD deve alternar explicitamente entre lista e editor.');
  assertTrue_(html.indexOf("setEventTypeCrudView('editor')")!==-1 && html.indexOf("setEventTypeCrudView('list')")!==-1,'Novo/editar e retorno devem ter estados visuais separados.');
  assertTrue_(html.indexOf("el.cancelEventTypeBtn.addEventListener('click', returnToEventTypeList)")!==-1,'Botão secundário deve voltar à lista sem fechar o modal inteiro.');
}

function testUx3ThemeFocusedCrudContract_() {
  const html=HtmlService.createHtmlOutputFromFile('index').getContent();
  assertTrue_(html.indexOf('UX03_THEMES_FOCUSED_CRUD')!==-1,'Temas devem usar editor focado.');
  assertTrue_(html.indexOf('function setThemeCrudView(mode)')!==-1,'Temas devem alternar entre lista e editor.');
  assertTrue_(html.indexOf('>Identidade institucional</button>')!==-1 && html.indexOf('>Cores e eventos</button>')!==-1,'Editor de Tema deve manter os grupos funcionais por assunto.');
  assertTrue_(html.indexOf('>Prévia do tema</button>')!==-1,'Prévia deve permanecer como área funcional própria e legível.');
}

function testUx4RemainingModalCrudContract_() {
  const html=HtmlService.createHtmlOutputFromFile('index').getContent();
  assertTrue_(html.indexOf('UX04_REMAINING_MODAL_CRUDS')!==-1,'Demais ferramentas modais devem seguir o mesmo padrão leve.');
  assertTrue_(html.indexOf('function setHolidayCrudView(mode)')!==-1,'Feriados devem alternar lista/editor sem duas colunas simultâneas.');
  assertTrue_(html.indexOf('#schoolDayModal.admin-modal')!==-1 && html.indexOf('#auditModal.audit-modal')!==-1,'Dias letivos e Auditoria devem usar geometria contida.');
}

function testUx5CalendarComfortContract_() {
  const html=HtmlService.createHtmlOutputFromFile('index').getContent();
  assertTrue_(html.indexOf('UX05_CALENDAR_COMFORT')!==-1,'Mesa deve registrar o ciclo de conforto visual.');
  assertTrue_(html.indexOf('.calendar-stage { padding:14px 16px 16px; gap:10px; }')!==-1,'Calendário deve ganhar respiro sem alterar sua lógica.');
  assertTrue_(html.indexOf('.event-chip { min-height:27px; padding:5px 8px; border-radius:9px; }')!==-1,'Eventos devem ficar mais legíveis em uso prolongado.');
}

function testUx6EventEditorComfortContract_() {
  const html=HtmlService.createHtmlOutputFromFile('index').getContent();
  assertTrue_(html.indexOf('UX06_EVENT_EDITOR')!==-1,'Editor de evento deve registrar refinamento próprio.');
  assertTrue_(html.indexOf('width:min(430px,calc(100% - 36px))')!==-1,'Editor deve permanecer estreito e temporário, sem dominar a folha.');
  assertTrue_(html.indexOf('.drawer-footer { padding:12px 18px 16px; background:var(--surface); position:sticky')!==-1,'Ações do editor devem permanecer previsíveis e visíveis.');
}

function testUx7ThemeGeneratorComfortContract_() {
  for (let i=0;i<12;i++) {
    const result=generateThemeSuggestion(i);
    assertTrue_(result.ok,'Gerador deve encontrar uma paleta confortável.');
    assertTrue_(isComfortableGeneratedTheme_(result.theme),'Toda sugestão automática deve passar pela barreira de conforto visual.');
    assertTrue_(contrastRatio_(result.theme.textColor,result.theme.surfaceBg)>=7,'Texto principal gerado deve privilegiar leitura prolongada.');
    assertTrue_(contrastRatio_(result.theme.mutedColor,result.theme.surfaceBg)>=4.5,'Texto auxiliar gerado deve permanecer legível.');
  }
}

function testUx8VisualConsolidationContract_() {
  const html=HtmlService.createHtmlOutputFromFile('index').getContent();
  assertTrue_(html.indexOf('UX08_VISUAL_CONSOLIDATION')!==-1,'Consolidação visual final deve estar identificada.');
  assertTrue_(html.indexOf('.admin-modal .form-grid-2,.admin-modal .form-grid-3 { grid-template-columns:1fr; }')!==-1,'Modais não devem voltar a usar formulários densos em duas colunas.');
  assertTrue_(html.indexOf('.admin-modal .field input,.admin-modal .field textarea,.admin-modal .field select { min-height:44px; background:transparent; }')!==-1,'Campos modais devem manter área confortável de interação.');
}


function testUx9ModalTopActionsContract_() {
  const html=HtmlService.createHtmlOutputFromFile('index').getContent();
  assertTrue_(html.indexOf('UX09_INTERFACE_REFINEMENT')!==-1,'UX9 deve registrar o refinamento visual consolidado.');
  ['eventTypeForm','holidayForm','themeForm'].forEach(function(formId){
    const formPos=html.indexOf('id="'+formId+'"');
    const barPos=html.lastIndexOf('modal-commandbar',formPos);
    assertTrue_(barPos!==-1 && barPos<formPos,'As ações do modal devem aparecer antes do formulário '+formId+'.');
  });
  const schoolModal=html.indexOf('id="schoolDayModal"');
  const schoolActions=html.indexOf('modal-commandbar',schoolModal);
  const schoolBody=html.indexOf('class="school-day-parameters"',schoolModal);
  assertTrue_(schoolActions!==-1 && schoolActions<schoolBody,'Dias letivos deve manter ações de controle no topo do modal.');
}

function testUx9SelectionHighlightContract_() {
  const html=HtmlService.createHtmlOutputFromFile('index').getContent();
  assertTrue_(html.indexOf("highlightClass: 'ca-calendar-selection-highlight'")!==-1,'Seleção por arraste deve usar o hook público highlightClass da FullCalendar v7.');
  assertTrue_(html.indexOf('.ca-calendar-selection-highlight')!==-1 && html.indexOf('rgba(55, 150, 91, .24)')!==-1,'Seleção por arraste deve usar verde suave e visível.');
  assertTrue_(html.indexOf('selectable: isCurrentVersionEditable()')!==-1 && html.indexOf('selectMirror: true')!==-1,'A seleção deve permanecer ativa somente no RASCUNHO, sem remover o gesto de arrastar.');
}

function testUx9ThemeProgressiveEditorContract_() {
  const html=HtmlService.createHtmlOutputFromFile('index').getContent();
  assertTrue_(html.indexOf('id="themeTabIdentity" type="button" role="tab" aria-selected="true"')!==-1,'O editor de Tema deve iniciar pela Identidade institucional.');
  assertTrue_(html.indexOf('id="themeSectionColors" role="tabpanel" aria-labelledby="themeTabColors" hidden')!==-1 && html.indexOf('id="themeSectionPage" role="tabpanel" aria-labelledby="themeTabPage" hidden')!==-1 && html.indexOf('id="themeSectionPreview" role="tabpanel" aria-labelledby="themeTabPreview" hidden')!==-1,'Somente uma área temática deve iniciar visível.');
  assertTrue_(html.indexOf('function activateThemeTab(sectionId, moveFocus)')!==-1,'Temas deve manter navegação progressiva própria.');
  assertTrue_(html.indexOf('panel.hidden = panel.id !== selectedPanelId')!==-1,'A navegação deve manter somente um painel temático visível por vez.');
  assertTrue_(html.indexOf('#themesModal .event-type-form { min-height: 0; overflow-y: auto; overflow-x: hidden; align-content: start; }')!==-1,'Rolagem deve ocorrer no corpo do editor sem recortar o conteúdo.');
  assertTrue_(html.indexOf('#themesModal .theme-editor-sticky-head {')!==-1 && html.indexOf('position: sticky; top: 0; z-index: 8;')!==-1,'Nome e navegação do Tema devem permanecer acessíveis durante a edição.');
}

function testUx9EventVisualFilterContract_() {
  const html=HtmlService.createHtmlOutputFromFile('index').getContent();
  assertTrue_(html.indexOf('id="eventFilterBtn"')!==-1 && html.indexOf('id="eventFilterSearch"')!==-1,'Calendário deve oferecer filtro pesquisável de Tipos de Evento.');
  assertTrue_(html.indexOf('id="eventFilterAllBtn"')!==-1 && html.indexOf('id="eventFilterNoneBtn"')!==-1 && html.indexOf('id="eventFilterShowAllBtn"')!==-1,'Filtro deve oferecer Todos, Nenhum e Mostrar todos.');
  const start=html.indexOf('function applyEventVisibilityFilter()');
  const end=html.indexOf('function updateEventFilterBadge()',start);
  assertTrue_(start!==-1 && end>start,'Aplicação do filtro visual deve existir.');
  const flow=html.slice(start,end);
  assertTrue_(flow.indexOf("eventApi.setProp('display'")!==-1,'Filtro deve atuar somente na exibição dos eventos já carregados.');
  assertTrue_(flow.indexOf('google.script.run')===-1 && flow.indexOf('refreshAudit')===-1 && flow.indexOf('applySchoolDayModel')===-1,'Filtro visual não pode chamar persistência, auditoria ou cálculo de dias letivos.');
}

function testUx9ListViewContract_() {
  const html=HtmlService.createHtmlOutputFromFile('index').getContent();
  assertTrue_(html.indexOf('data-view="eventList"')!==-1,'Barra do calendário deve oferecer o modo Lista.');
  assertTrue_(html.indexOf("eventList: { type: 'list', duration: { years: 1 }")!==-1,'Lista deve usar a visualização cronológica nativa do FullCalendar.');
  assertTrue_(html.indexOf('eventClick: handleCalendarEventClick')!==-1,'Clique em item da Lista deve reutilizar o mesmo editor de evento.');
  const classHookStart=html.indexOf('eventClassNames: function(info)');
  const classHook=html.slice(classHookStart,classHookStart+420);
  assertTrue_(classHookStart!==-1&&classHook.indexOf('ca-themed-event')!==-1&&classHook.indexOf('isCalendarEventHiddenByVisualFilter(info.event)')!==-1,'Lista e grade devem compartilhar o mesmo filtro visual, mesmo quando o Tema acrescenta sua classe de exibição.');
}

function testUx10ThemeTabsContract_() {
  const html=HtmlService.createHtmlOutputFromFile('index').getContent();
  assertTrue_(html.indexOf('UX10_THEME_TABS')!==-1,'UX10 deve registrar a navegação do editor de Temas por abas.');
  assertTrue_(html.indexOf('id="themeTabs" role="tablist"')!==-1,'As seções do Tema devem usar um tablist acessível.');
  ['themeTabIdentity','themeTabColors','themeTabPage','themeTabPreview'].forEach(function(id){
    assertTrue_(html.indexOf('id="'+id+'"')!==-1,'Aba ausente: '+id+'.');
  });
  ['themeSectionIdentity','themeSectionColors','themeSectionPage','themeSectionPreview'].forEach(function(id){
    const pos=html.indexOf('id="'+id+'"');
    assertTrue_(pos!==-1 && html.slice(Math.max(0,pos-90),pos+180).indexOf('role="tabpanel"')!==-1,'Painel de aba ausente ou sem semântica: '+id+'.');
  });
  assertTrue_(html.indexOf('<details class="theme-section"')===-1,'O editor de Temas não deve voltar à pilha de accordions.');
  assertTrue_(html.indexOf("event.key === 'ArrowRight'")!==-1 && html.indexOf("event.key === 'ArrowLeft'")!==-1 && html.indexOf("event.key === 'Home'")!==-1 && html.indexOf("event.key === 'End'")!==-1,'Abas devem oferecer navegação por teclado.');
  assertTrue_(html.indexOf('overflow-x: auto; overflow-y: hidden;')!==-1 && html.indexOf('white-space: nowrap;')!==-1,'Em telas estreitas, a barra de abas deve rolar horizontalmente sem retornar a accordions.');
  assertTrue_(html.indexOf("if (selectedPanelId === 'themeSectionPreview') renderThemePreview();")!==-1,'Abrir a aba Prévia deve atualizar a prévia sob demanda.');
}

function testUx10PdfUsesExactUserEventColor_() {
  const hotPink='#ff1493';
  const normalized=normalizeThemePayload_({
    name:'Tema controle de cor',pageBg:'#ffffff',surfaceBg:'#ffffff',textColor:'#111111',mutedColor:'#555555',accentColor:'#117733',
    eventColors:['#111111','#222222','#333333',hotPink,'#555555','#666666'],backgroundMode:'SOLID',backgroundValue:'#ffffff',
    monthEventsLayout:'STACKED',monthsPerPage:4,pageOrientation:'LANDSCAPE',showWeeklyTotals:true,weeklyTotalsPosition:'LAST',monthlyTotalPosition:'AFTER_TABLE'
  });
  assertEquals_(hotPink,normalized.eventColors[3],'Normalização do Tema deve preservar exatamente a cor válida escolhida pelo usuário.');
  const row=themeClientToRow_(normalized);
  assertEquals_(hotPink,row.event_color_4,'Serialização para THEMES deve preservar exatamente a cor escolhida para Atenção.');
  assertEquals_(hotPink,themeColorForVisualRole_(normalized,'ATENCAO'),'Resolução visual deve devolver exatamente a cor escolhida pelo usuário.');
  const event={id:'UX10-PINK',eventTypeId:'UX10-FERIAS',title:'Férias acadêmicas',startDate:'2099-01-05',endDate:'2099-01-07'};
  const html=buildPreviewMonth_(2099,1,[event],{dates:[],byMonth:{}},{holidays:[],occurrences:[]},[],normalized,{'UX10-FERIAS':{visualRole:'ATENCAO',schoolPeriod:false}});
  assertTrue_(html.indexOf('background-color:'+hotPink)!==-1,'Prévia/PDF deve renderizar o rosa-choque escolhido pelo usuário, sem substituição de paleta.');
  assertTrue_(html.indexOf('border-left:3px solid '+hotPink)!==-1 || html.indexOf('border-bottom:4px solid '+hotPink)!==-1 || html.indexOf('border:2px solid '+hotPink)!==-1,'Marcador do evento deve carregar a mesma cor concreta no HTML destinado à impressão/PDF.');
  const css=previewCss_(normalized);
  assertTrue_(css.indexOf('print-color-adjust:exact!important')!==-1 && css.indexOf('-webkit-print-color-adjust:exact!important')!==-1,'CSS de impressão deve exigir preservação exata das cores escolhidas.');
}

function testThemeColorSchemeGenerator_() {
  const seen={};
  for(let seed=1;seed<=10;seed++){
    const result=generateThemeColorScheme(seed);
    assertTrue_(result.ok,'Gerador de esquema cromático deve retornar uma combinação válida.');
    const scheme=result.scheme||{};
    assertTrue_(Array.isArray(scheme.eventColors) && scheme.eventColors.length===6,'Esquema deve conter as seis funções visuais de evento.');
    assertTrue_(contrastRatio_(scheme.textColor,scheme.surfaceBg)>=7,'Texto principal do esquema deve manter contraste forte.');
    assertTrue_(contrastRatio_(scheme.mutedColor,scheme.surfaceBg)>=4.5,'Texto auxiliar do esquema deve permanecer legível.');
    assertTrue_(contrastRatio_(scheme.accentColor,scheme.surfaceBg)>=3,'Destaque do esquema deve permanecer distinguível.');
    assertFalse_(Object.prototype.hasOwnProperty.call(scheme,'name'),'Gerar esquema de cores não pode substituir o nome do Tema.');
    assertFalse_(Object.prototype.hasOwnProperty.call(scheme,'headerText'),'Gerar esquema de cores não pode substituir identidade institucional.');
    assertFalse_(Object.prototype.hasOwnProperty.call(scheme,'monthsPerPage'),'Gerar esquema de cores não pode substituir configuração de página.');
    assertFalse_(Object.prototype.hasOwnProperty.call(scheme,'pageOrientation'),'Gerar esquema de cores não pode substituir a orientação escolhida pelo usuário.');
    seen[scheme.accentColor]=true;
  }
  assertEquals_(10,Object.keys(seen).length,'As dez primeiras tentativas devem oferecer dez esquemas distintos antes de repetir o ciclo curado.');
}

function testUx11ThemeColorSchemeControlContract_() {
  const html=HtmlService.createHtmlOutputFromFile('index').getContent();
  assertTrue_(html.indexOf('UX11_THEME_COLOR_SCHEMES')!==-1,'UX11 deve registrar o gerador iterativo de esquemas de cores.');
  const rowStart=html.indexOf('class="theme-name-actions"');
  const tabsStart=html.indexOf('class="theme-tabs"',rowStart);
  assertTrue_(rowStart!==-1 && tabsStart>rowStart,'Nome do tema e ação cromática devem formar a linha compacta acima das abas.');
  const row=html.slice(rowStart,tabsStart);
  assertTrue_(row.indexOf('id="themeName"')!==-1 && row.indexOf('id="generateThemeColorsBtn"')!==-1,'Nome e Gerar esquema de cores devem dividir a mesma linha do editor.');
  assertTrue_(html.indexOf('grid-template-columns: minmax(0,1fr) auto;')!==-1,'O nome deve ocupar apenas o espaço restante, reservando área própria para o botão.');
  const start=html.indexOf('function generateThemeColorsFromEditor()');
  const end=html.indexOf('function escapeHtmlClient',start);
  assertTrue_(start!==-1 && end>start,'Fluxo Gerar esquema de cores deve existir no cliente.');
  const flow=html.slice(start,end);
  assertTrue_(flow.indexOf("activateThemeTab('themeSectionPreview', false)")!==-1,'Clicar em Gerar esquema de cores deve levar automaticamente à aba Prévia.');
  assertTrue_(flow.indexOf('.generateThemeColorScheme(state.themeGenerationSeed)')!==-1,'A ação deve solicitar somente um novo esquema cromático.');
  assertTrue_(flow.indexOf('setSaving(true')===-1,'Gerar esquema cromático não deve proteger a aplicação inteira, pois não persiste dados nem altera o banco.');
  const applyStart=html.indexOf('function applyThemeColorSchemeToForm(scheme)');
  const applyEnd=html.indexOf('function setThemeColorSchemeBusy',applyStart);
  const applyFlow=html.slice(applyStart,applyEnd);
  ['themePageBg','themeSurfaceBg','themeTextColor','themeMutedColor','themeAccentColor','themeEventColor1','themeEventColor6'].forEach(function(id){
    assertTrue_(applyFlow.indexOf(id)!==-1,'Aplicação do esquema deve atualizar a cor '+id+'.');
  });
  assertTrue_(applyFlow.indexOf('themeName')===-1 && applyFlow.indexOf('themeHeaderText')===-1 && applyFlow.indexOf('themeMonthsPerPage')===-1,'A ação cromática deve preservar nome, identidade e configuração de página.');
  assertTrue_(applyFlow.indexOf('renderThemePreview()')!==-1,'Cada esquema aplicado deve redesenhar a Prévia imediatamente.');
}

function testBeta5Bg11CalendarGridBordersContract_() {
  const html = HtmlService.createHtmlOutputFromFile('index').getContent();

  assertTrue_(html.indexOf("tableClass: 'ca-calendar-grid-frame'") !== -1, 'A folha deve usar o hook público tableClass para o contorno da grade.');
  assertTrue_(html.indexOf("tableHeaderClass: 'ca-calendar-grid-header'") !== -1, 'A folha deve usar tableHeaderClass para separar cabeçalho e corpo.');
  assertTrue_(html.indexOf("dayHeaderClass: function(info) { return calendarThemeDayClasses_('ca-calendar-grid-day-header', info); }") !== -1, 'Os cabeçalhos dos dias devem receber a classe autoral de divisória vertical e a classe temática de fim de semana.');
  assertTrue_(html.indexOf("dayRowClass: 'ca-calendar-grid-row'") !== -1, 'As semanas devem receber a classe autoral de divisória horizontal.');
  assertTrue_(html.indexOf("dayCellClass: function(info) { return calendarThemeDayClasses_('ca-calendar-grid-cell', info); }") !== -1, 'As células dos dias devem receber a classe autoral de divisória vertical e a classe temática de fim de semana.');

  assertTrue_(html.indexOf('.ca-calendar-grid-frame {') !== -1 && html.indexOf('border: 1px solid var(--line);') !== -1, 'O calendário precisa de contorno externo explícito.');
  assertTrue_(html.indexOf('.ca-calendar-grid-header { box-shadow: inset 0 -1px 0 var(--line); }') !== -1, 'Cabeçalho e corpo devem ter divisória horizontal explícita.');
  assertTrue_(html.indexOf('.ca-calendar-grid-row { box-shadow: inset 0 -1px 0 var(--line); }') !== -1, 'Cada semana deve ter uma divisória horizontal explícita.');
  assertTrue_(html.indexOf('.ca-calendar-grid-cell { box-shadow: inset -1px 0 0 var(--line); }') !== -1, 'Cada dia deve ter uma divisória vertical explícita.');

  assertTrue_(html.indexOf('--fc-border-color') === -1, 'A correção não deve voltar a depender da variável legada --fc-border-color.');
  assertTrue_(html.indexOf('.fc-theme-standard td') === -1 && html.indexOf('.fc-daygrid-day') === -1, 'A correção não deve acoplar a folha a seletores internos .fc-* do FullCalendar.');
}

function testBeta5Bg12SelectionHighlightHookContract_() {
  const html = HtmlService.createHtmlOutputFromFile('index').getContent();
  assertTrue_(html.indexOf("highlightClass: 'ca-calendar-selection-highlight'") !== -1, 'BG12 deve ligar a seleção ao hook público highlightClass da FullCalendar v7.');
  assertTrue_(html.indexOf('.ca-calendar-selection-highlight {') !== -1, 'BG12 deve possuir classe autoral para a camada temporária de seleção.');
  assertTrue_(html.indexOf('background: rgba(55, 150, 91, .24) !important;') !== -1, 'A seleção precisa ter preenchimento verde claramente visível.');
  assertTrue_(html.indexOf('box-shadow: inset 0 0 0 1px rgba(35, 122, 80, .42) !important;') !== -1, 'A seleção precisa ter contorno perceptível sobre a grade.');
  assertTrue_(html.indexOf('--fc-highlight-color') === -1, 'BG12 não deve voltar a depender da variável antiga --fc-highlight-color.');
  assertTrue_(html.indexOf('.fc-highlight') === -1, 'BG12 não deve acoplar o CSS ao seletor interno .fc-highlight.');
}


function testPv9PdfPaginationAndRepeatingFurnitureContract_() {
  assertEquals_(1, previewPageColumnCount_(1), '1 mês por página deve usar uma coluna.');
  assertEquals_(2, previewPageColumnCount_(2), '2 meses por página devem usar duas colunas.');
  assertEquals_(2, previewPageColumnCount_(4), '4 meses por página devem usar grade 2x2.');
  assertEquals_(3, previewPageColumnCount_(6), '6 meses por página devem usar grade 3x2.');
  assertEquals_(4, previewPageColumnCount_(12), '12 meses por página devem usar grade anual 4x3.');
  assertEquals_(1, previewPageRowCount_(1), '1 mês deve ocupar uma linha.');
  assertEquals_(1, previewPageRowCount_(2), '2 meses devem ocupar uma linha.');
  assertEquals_(2, previewPageRowCount_(4), '4 meses devem ocupar duas linhas.');
  assertEquals_(2, previewPageRowCount_(6), '6 meses devem ocupar duas linhas.');
  assertEquals_(3, previewPageRowCount_(12), '12 meses devem ocupar três linhas.');
  const source = previewCss_({monthsPerPage:12,pageBg:'#fff',surfaceBg:'#fff',textColor:'#000',mutedColor:'#333',accentColor:'#287a3f'});
  assertTrue_(source.indexOf("width:'+printWidth+'") === -1, 'CSS retornado deve estar materializado, sem fragmentos do fonte.');
  assertTrue_(source.indexOf('width:291mm') !== -1 && source.indexOf('height:204mm') !== -1, '12 meses devem usar toda a área imprimível de uma A4 paisagem com margem técnica mínima.');
  assertTrue_(source.indexOf('grid-template-rows:repeat(var(--month-rows,1)') !== -1, 'PDF deve limitar também as linhas da grade de meses.');
  assertTrue_(source.indexOf('.page-header') !== -1 && source.indexOf('.page-footer') !== -1, 'Cabeçalho e rodapé devem fazer parte de cada página física.');
  const fileSource = String(buildLivePreviewHtml_);
  assertTrue_(fileSource.indexOf('data-months-per-page=') !== -1, 'Cada página deve registrar a configuração efetiva de meses por página.');
  assertTrue_(fileSource.indexOf('<header class="page-header">') !== -1 && fileSource.indexOf('<footer class="page-footer">') !== -1, 'Cada chunk de meses deve construir seu próprio cabeçalho e rodapé.');
}


function testPv10VersionActionVisibilityAndLanguageContract_() {
  const html = HtmlService.createHtmlOutputFromFile('index').getContent();
  assertTrue_(html.indexOf('[hidden] { display: none !important; }') !== -1, 'O atributo hidden deve vencer estilos de botões e impedir ações incompatíveis de aparecer.');
  assertTrue_(html.indexOf("section(compliance,'Pendências',blockers") !== -1, 'Relatório deve usar linguagem proporcional: Pendências.');
  assertFalse_(html.indexOf('Pendências bloqueantes') !== -1, 'A interface não deve chamar pendências ordinárias de bloqueantes.');
  const versionSource = String(finalizeCalendarVersion);
  assertTrue_(versionSource.indexOf('De acordo com as regras cadastradas, o calendário ainda possui pendências.') !== -1, 'Finalização deve devolver a mensagem aprovada para pendências.');
  const modeSource = StringFromHtmlFunction_(html,'function applyVersionInteractionMode()','function handleVersionPrimaryAction()');
  assertTrue_(modeSource.indexOf('el.versionReportBtn.hidden=!finalized') !== -1, 'Relatório deve aparecer apenas em FINALIZADO.');
  assertTrue_(modeSource.indexOf('el.reopenVersionBtn.hidden=!finalized') !== -1, 'Reabrir deve aparecer apenas em FINALIZADO.');
  assertTrue_(modeSource.indexOf('el.versionPdfBtn.hidden=!immutable') !== -1, 'PDF deve aparecer apenas em PUBLICADO/ARQUIVADO.');
  assertTrue_(modeSource.indexOf("status==='PUBLICADO'&&hasPublished&&!hasPreparation") !== -1, 'Retificar deve aparecer somente ao consultar a versão PUBLICADO vigente e sem outra elaboração.');
}


function testPv11SetupChoiceAndCleanBaseContract_() {
  const setupSource = String(setup);
  assertTrue_(setupSource.indexOf('showSetupChoiceDialog_') !== -1, 'setup() sem modo deve abrir a escolha antes de executar mutações.');
  const dialogSource = String(showSetupChoiceDialog_);
  assertTrue_(dialogSource.indexOf('Atualizar instalação') !== -1 && dialogSource.indexOf('Criar nova instalação') !== -1, 'Wizard deve oferecer as duas escolhas aprovadas.');
  assertTrue_(dialogSource.indexOf('Apagar dados e criar nova instalação') !== -1, 'Reset precisa de confirmação explícita própria, sem confirm() nativo.');
  assertFalse_(dialogSource.indexOf('confirm(') !== -1, 'Setup não deve usar confirm() nativo.');
  const resetSource = String(resetManagedInstallation_);
  assertTrue_(resetSource.indexOf('clearContent') !== -1 && resetSource.indexOf('ACTIVE_CALENDAR_USER_PROPERTY') !== -1, 'Reset deve limpar dados gerenciados e a versão ativa do usuário.');
  const codeSource = String(getBootstrapData);
  assertTrue_(codeSource.indexOf('calendar:null') !== -1, 'Bootstrap deve aceitar uma base pronta sem Projeto/calendário.');
  const versionSource = String(resolveActiveCalendarId_);
  assertTrue_(versionSource.indexOf("return project ? project.activeCalendarId : ''") !== -1, 'Sem Projeto, não deve inventar CAL-DEFAULT como calendário operacional.');
}

function testPv11SetupSeedCatalogContract_() {
  assertEquals_('THEME-IFTM-LIGHT', DEFAULT_THEMES[0].id, 'Tema institucional claro deve ser o padrão inicial.');
  assertTrue_(DEFAULT_THEMES.some(function(t){return t.id==='THEME-IFTM-DARK' && /SUAVE/.test(t.name);}), 'Tema escuro inicial deve explicitar proposta suave.');
  assertTrue_(DEFAULT_THEMES.some(function(t){return t.id==='THEME-IFTM-CONTRAST';}), 'Tema de alto contraste deve permanecer no setup.');
  assertEquals_(3, DEFAULT_THEMES.length, 'Setup limpo deve possuir exatamente três Temas-base definidos.');
  const seedSource = String(seedNationalHolidayCatalogFromApi_);
  assertTrue_(seedSource.indexOf('fetchNationalHolidaySource_') !== -1 && seedSource.indexOf("scope:'NACIONAL'") !== -1, 'Setup deve consultar e cadastrar feriados nacionais.');
  const projectSource = String(createCalendarProject);
  assertTrue_(projectSource.indexOf("theme_id: 'THEME-IFTM-LIGHT'") !== -1, 'Versão 1 de um novo Projeto deve nascer com o Tema Institucional Claro.');
  const plan = getSetupMenuPlan_('RESET');
  assertTrue_(plan.some(function(step){return /sem Projetos/.test(step.label);}), 'Plano de nova instalação deve verificar explicitamente que não existe Projeto pré-criado.');
}


function testPv12ResetPreflightSafetyContract_() {
  const stepSource = String(runSetupMenuStep_);
  const preflightPos = stepSource.indexOf('preflightResetHolidaySource_');
  const resetPos = stepSource.indexOf('resetManagedInstallation_');
  assertTrue_(preflightPos !== -1 && resetPos > preflightPos, 'Nova instalação deve validar os feriados antes de apagar dados gerenciados.');
  const seedSource = String(seedNationalHolidayCatalogFromApi_);
  assertTrue_(seedSource.indexOf('sourceOverride') !== -1, 'Após o reset, o cadastro deve reutilizar a fonte previamente validada em vez de depender de uma segunda chamada externa.');
  assertTrue_(seedSource.indexOf('national_holidays_seeded_count') !== -1, 'Atualização deve detectar catálogo nacional incompleto, não confiar apenas em um marcador booleano.');
  const preflightSource = String(preflightResetHolidaySource_);
  assertTrue_(preflightSource.indexOf('A instalação atual foi preservada.') !== -1, 'Falha de pré-requisito deve informar que a instalação existente não foi apagada.');
}

function testPv12EmptyWorkspaceAvailabilityContract_() {
  const html = HtmlService.createHtmlOutputFromFile('index').getContent();
  assertTrue_(html.indexOf("Nenhum Projeto de Calendário aberto") !== -1, 'Base sem Projeto deve possuir estado visual explícito.');
  assertTrue_(html.indexOf("el.eventFilterBtn.disabled = true") !== -1, 'Ferramentas que exigem calendário devem ficar indisponíveis antes do primeiro Projeto.');
  assertTrue_(html.indexOf("if(state.calendar) state.calendar.prev()") !== -1 && html.indexOf("if(state.calendar) state.calendar.next()") !== -1, 'Navegação não pode lançar erro quando ainda não existe FullCalendar.');
  assertTrue_(html.indexOf("Nenhum Projeto cadastrado. Crie o primeiro Projeto para começar.") !== -1, 'Modal deve orientar diretamente a criação do primeiro Projeto.');
  assertTrue_(html.indexOf("if(!state.calendarRecord&&!(state.projects||[]).length)return") !== -1, 'Modal obrigatório do primeiro Projeto não deve ser fechado deixando uma mesa sem contexto.');
  assertTrue_(html.indexOf("status==='PUBLICADO'&&hasPublished&&!hasPreparation") !== -1, 'Retificar não deve aparecer ao consultar uma versão ARQUIVADO; é ação do Projeto apresentada na publicação vigente.');
}


function testPv13FirstProjectWorkspaceSyncContract_() {
  const html = HtmlService.createHtmlOutputFromFile('index').getContent();
  const createStart = html.indexOf('function createProjectFromModal');
  const createEnd = html.indexOf('function openVersionFromModal', createStart);
  assertTrue_(createStart !== -1 && createEnd > createStart, 'Fluxo de criação de Projeto deve existir no frontend.');
  const createSource = html.slice(createStart, createEnd);
  assertTrue_(createSource.indexOf('getProjectsWorkspaceData') !== -1, 'Após criar o primeiro Projeto, a Gaveta deve ser relida do backend antes da conclusão.');
  assertTrue_(createSource.indexOf('reconcileCreatedProjectWorkspace_(result,workspace)') !== -1, 'Criação deve reconciliar o bootstrap com a coleção canônica de Projetos.');
  const closePos = createSource.indexOf('closeProjectsModal()');
  const successPos = createSource.indexOf("showFeedback('Projeto criado. A Versão 1 está pronta para edição.'");
  assertTrue_(closePos !== -1 && successPos > closePos, 'Mensagem de sucesso só deve ser exibida depois de a interface estar sincronizada e pronta para edição.');

  const bootstrapStart = html.indexOf('function applyBootstrapWorkspace');
  const bootstrapEnd = html.indexOf('function openTools', bootstrapStart);
  const bootstrapSource = html.slice(bootstrapStart, bootstrapEnd);
  assertTrue_(bootstrapSource.indexOf('state.projects=data.projects||[]') !== -1, 'applyBootstrapWorkspace deve atualizar a coleção de Projetos a partir do bootstrap do servidor.');
  assertTrue_(bootstrapSource.indexOf("if(el.projectsModal.classList.contains('open'))renderProjectsWorkspace()") !== -1, 'Se a Gaveta estiver aberta durante uma troca de bootstrap, sua lista deve ser redesenhada imediatamente.');
  assertTrue_(bootstrapSource.indexOf('state.projects=data.projects||[]') < bootstrapSource.indexOf('if(!data.calendar)'), 'Projetos devem ser sincronizados mesmo em bootstraps sem calendário, evitando estado vazio residual.');

  const backendSource = String(createCalendarProject);
  assertTrue_(backendSource.indexOf('SpreadsheetApp.flush()') !== -1, 'Backend deve confirmar as escritas antes de montar o bootstrap pós-criação.');
  assertTrue_(backendSource.indexOf('getBootstrapData(calendarId)') !== -1, 'Resposta de criação deve devolver o bootstrap completo da Versão 1 recém-criada.');
  assertTrue_(backendSource.indexOf('projectId: projectId') !== -1 && backendSource.indexOf('calendarId: calendarId') !== -1, 'Backend deve devolver os IDs explícitos criados para a reconciliação forte do PV15.');
}

function testGlobalCascadeMutationContract_() {
  const html = HtmlService.createHtmlOutputFromFile('index').getContent();

  function flow(name, nextName) {
    const start = html.indexOf('function ' + name);
    const end = nextName ? html.indexOf('function ' + nextName, start + 1) : html.length;
    assertTrue_(start !== -1 && end > start, 'Fluxo não encontrado para varredura de cascata: ' + name + '.');
    return html.slice(start, end);
  }

  const eventSave = flow('submitEvent(event)', 'submitVariableHolidayFromEditor()');
  assertTrue_(eventSave.indexOf('upsertCalendarEvent(result.event)') !== -1, 'Salvar evento deve atualizar a ocorrência na mesa sem recarga.');
  assertTrue_(eventSave.indexOf('applySchoolDayModel(result.schoolDayModel || null)') !== -1, 'Salvar evento deve recalcular os dias letivos quando aplicável.');

  const schoolDays = flow('submitSchoolDaySettings()', 'refreshSchoolDayModel()');
  assertTrue_(schoolDays.indexOf('applySchoolDayModel(result.schoolDayModel || null)') !== -1, 'Alterar a semana-base deve refletir imediatamente a nova contagem.');

  const holiday = flow('submitHoliday(event)', 'confirmDeleteHoliday()');
  assertTrue_(holiday.indexOf('syncAuxiliaryCalendarEvents()') !== -1, 'Salvar feriado deve redesenhar as ocorrências auxiliares na mesa.');
  assertTrue_(holiday.indexOf('applySchoolDayModel(result.schoolDayModel || null)') !== -1, 'Salvar feriado deve recalcular os dias letivos.');

  const eventType = flow('submitEventType(event)', 'confirmDeleteEventType()');
  assertTrue_(eventType.indexOf('syncCalendarEventTypesFromAdminState()') !== -1, 'Alterar Tipo de Evento deve atualizar o catálogo usado pelo renderer.');
  assertTrue_(eventType.indexOf('refreshPrimaryCalendarEventsAfterTypeChange') !== -1, 'Alterar categoria/função visual deve redesenhar os eventos sem F5 por caminho compatível com FullCalendar v7.');

  const themeApply = flow('useTheme()', 'applyThemeCascade(theme, reason)');
  assertTrue_(themeApply.indexOf("applyThemeCascade(result.theme,'THEME_APPLY')") !== -1, 'Trocar de Tema deve atualizar a mesa em cascata.');

  const title = flow('saveCalendarTitleFromHeader()', 'openTools()');
  assertTrue_(title.indexOf('el.calendarName.textContent=result.calendar.title') !== -1, 'Alterar título deve refletir imediatamente no cabeçalho da mesa.');
}

function testBeta5Bg3CalendarTitleEditorContract_() {
  const html = HtmlService.createHtmlOutputFromFile('index').getContent();
  assertTrue_(html.indexOf('.brand-title-editor[hidden] { display:none !important; }') !== -1, 'O editor oculto do título não pode permanecer visível por conflito de CSS.');
  assertTrue_((html.indexOf('class="brand-title-row"><div class="brand-title"') !== -1 || html.indexOf('class="brand-title-row"><div class="project-context"><div class="brand-title"') !== -1) && html.indexOf('id="calendarTitleEditor" hidden') !== -1, 'Título/contexto do Projeto e editor devem ocupar a mesma região estrutural do cabeçalho.');
  assertTrue_(html.indexOf("el.calendarName.addEventListener('dblclick', startCalendarTitleEdit)") !== -1, 'O editor do título deve abrir somente sob ação explícita do usuário.');
  assertTrue_(html.indexOf('el.calendarTitleEditor.hidden=false;el.calendarName.hidden=true') !== -1, 'Ao editar, o campo deve substituir o título em vez de disputar espaço com ele.');
  assertTrue_(html.indexOf('el.calendarTitleEditor.hidden=true;el.calendarName.hidden=false') !== -1, 'Ao concluir/cancelar, somente o título deve voltar a ocupar o cabeçalho.');
}

function testPv1ProjectVersionSchemaContract_() {
  assertTrue_(Array.isArray(DB_SCHEMA.PROJECTS), 'PV1 deve criar PROJECTS.');
  ['project_id','version_number','source_version_id','rectification_reason','published_at','archived_at','publication_snapshot_json','finalization_report_json','row_version'].forEach(function(header) {
    assertTrue_(DB_SCHEMA.CALENDARS.indexOf(header) !== -1, 'CALENDARS deve conter ' + header + '.');
  });
  assertEquals_('RASCUNHO', normalizeCalendarVersionStatus_('rascunho'), 'Status deve ser normalizado.');
  assertTrue_(isCalendarVersionImmutableStatus_('PUBLICADO'), 'PUBLICADO deve ser imutável.');
  assertTrue_(isCalendarVersionImmutableStatus_('ARQUIVADO'), 'ARQUIVADO deve ser imutável.');
}

function testPv1ProjectVersionStateInvariantContract_() {
  const rows = [
    {id:'V1',project_id:'P', version_number:1, status:'ARQUIVADO', published_at:'2026-01-01T00:00:00Z'},
    {id:'V2',project_id:'P', version_number:2, source_version_id:'V1', status:'PUBLICADO', published_at:'2026-02-01T00:00:00Z'},
    {id:'V3',project_id:'P', version_number:3, source_version_id:'V2', status:'RASCUNHO'}
  ];
  assertTrue_(assertProjectVersionInvariants_('P', rows), 'Uma publicação e um rascunho devem ser válidos.');
  let failed = false;
  try { assertProjectVersionInvariants_('P', rows.concat([{id:'V4',project_id:'P', version_number:4, source_version_id:'V2', status:'FINALIZADO'}])); } catch (e) { failed = true; }
  assertTrue_(failed, 'Duas versões em elaboração devem ser rejeitadas.');
}

function testPv2ProjectWorkspaceContract_() {
  const code = String(getProjectsWorkspaceData) + String(createCalendarProject) + String(openCalendarVersion);
  assertTrue_(code.indexOf('listProjects_') !== -1, 'PV2 deve expor Projetos.');
  assertTrue_(code.indexOf('active_calendar_id') !== -1, 'PV2 deve persistir a versão ativa canônica do Projeto.');
  assertTrue_(String(openCalendarVersion).indexOf('setUserActiveCalendarId_')!==-1,'Abrir uma versão deve ser preferência por usuário, sem trocar a mesa de outras pessoas.');
  assertTrue_(String(createCalendarProject).indexOf('version_number: 1') !== -1, 'Novo Projeto deve criar Versão 1 automaticamente.');
}

function testPv2ProjectUiContract_() {
  const html = HtmlService.createHtmlOutputFromFile('index').getContent();
  ['projectContextBtn','projectVersionBadge','projectsModal','newProjectBtn','projectList','versionList'].forEach(function(id) {
    assertTrue_(html.indexOf('id="' + id + '"') !== -1, 'PV2 UI ausente: ' + id);
  });
  assertTrue_(html.indexOf('Versões do projeto') !== -1, 'Histórico de versões deve ser contextual.');
}

function testPv3FinalizationReportContract_() {
  const code=String(buildFinalizationReport_)+String(finalizeCalendarVersion)+String(reopenFinalizedCalendarVersion);
  ['byWeek','byMonth','bySemester','byYear','FINALIZATION_BLOCKED','finalization_report_json','EVENT_DATE_ORDER','EVENT_TYPE_MISSING','REPLACEMENT_SAME_DAY'].forEach(function(token){assertTrue_(code.indexOf(token)!==-1,'PV3 deve cobrir '+token);});
  const weeks=buildSchoolDayWeekSummary_(['2026-08-10','2026-08-11','2026-08-17']);
  assertEquals_(2,weeks.length,'Resumo semanal deve agrupar datas por semana.');
  assertEquals_(2,weeks[0].count,'Primeira semana deve conter dois dias.');
  const sem=buildSchoolDaySemesterSummary_(['2026-02-01','2026-08-01']);
  assertEquals_(2,sem.length,'Resumo semestral deve separar os semestres.');
}

function testPv3FinalizationUiContract_() {
  const html=HtmlService.createHtmlOutputFromFile('index').getContent();
  ['versionPrimaryAction','finalizationModal','finalizationReport','reopenVersionBtn','finalizationReopenBtn','finalizationPublishBtn'].forEach(function(id){assertTrue_(html.indexOf('id="'+id+'"')!==-1,'PV3 UI ausente: '+id);});
  assertTrue_(html.indexOf('Relatório de conferência')!==-1,'PV3 deve apresentar relatório na tela.');
  ['Checklist / Auditoria','Semana letiva padrão','Dias de reposição','Dias letivos por semana','Dias letivos por mês','Dias letivos por semestre','Totais anuais'].forEach(function(label){assertTrue_(html.indexOf(label)!==-1,'Relatório deve exibir '+label+'.');});
  assertTrue_(html.indexOf("selectable: isCurrentVersionEditable()")!==-1,'Calendário finalizado não deve aceitar seleção.');
}

function testPv4PublicationSnapshotContract_() {
  const code=String(publishCalendarVersion)+String(buildPublicationSnapshot_)+String(getVersionMaterializedData_);
  ['PUBLICATION','PUBLICADO','publication_note','events','eventTypes','schoolDayModel','holidayData','theme'].forEach(function(token){assertTrue_(code.indexOf(token)!==-1,'PV4 snapshot deve conter '+token);});
  assertEquals_('14/08/2026',publicationDatePt_('2026-08-14T22:10:00Z'),'Data de publicação deve ser exibida em pt-BR.');
  assertEquals_('14/08/2026',publicationDatePt_('2026-08-15T01:10:00Z'),'Publicação perto da meia-noite deve respeitar America/Sao_Paulo, não a data UTC.');
}
function testPv4ImmutableVersionUiContract_() {
  const html=HtmlService.createHtmlOutputFromFile('index').getContent();
  ['versionPdfBtn','publishedFootnote'].forEach(function(id){assertTrue_(html.indexOf('id="'+id+'"')!==-1,'PV4 UI ausente: '+id);});
  assertTrue_(html.indexOf("const immutable=status==='PUBLICADO'||status==='ARQUIVADO'")!==-1,'Publicado/arquivado devem entrar em modo imutável.');
  assertTrue_(html.indexOf('Gerar PDF')!==-1,'Versão imutável deve oferecer PDF.');
}
function testPv4MutationGuardContract_() {
  const code=[saveEvent,deleteEvent,saveCalendarTitle,setCalendarAuditRuleIgnored,saveSchoolDayException,deleteSchoolDayException,setCalendarTheme].map(String).join('\n');
  assertTrue_((code.match(/calendarVersionMutationFailure_/g)||[]).length>=7,'Mutações da versão devem consultar o guard de imutabilidade.');
  assertTrue_(String(calendarVersionMutationFailure_).indexOf('VERSION_READ_ONLY')!==-1,'Guard deve rejeitar versão não editável.');
}

function testPv5RectificationCloneContract_() {
  const code=String(createRectificationVersion)+String(clonePublishedVersionRows_)+String(validateRectificationMechanicalCopy_);
  ['VERSION_IN_PREPARATION','source_version_id','rectification_reason','nextVersionNumberForProject_','RECTIFICATION_COPY_FAILED'].forEach(function(token){assertTrue_(code.indexOf(token)!==-1,'PV5/R16 deve cobrir '+token);});
  assertTrue_(String(clonePublishedVersionRows_).indexOf('cloneCalendarScopedRows_')!==-1,'Retificação deve copiar diretamente as linhas persistidas da versão publicada.');
  assertFalse_(code.indexOf('getVersionMaterializedData_')!==-1||code.indexOf('buildSchoolDayModel_')!==-1,'Clonagem não pode materializar/revalidar regras de negócio da publicação.');
  assertEquals_(4,nextVersionNumberForProject_('P',[{project_id:'P',version_number:1},{project_id:'P',version_number:3}]),'Número de versão nunca deve ser reutilizado.');
}
function testPv5RectificationUiContract_() {
  const html=HtmlService.createHtmlOutputFromFile('index').getContent();
  ['projectRetifyBtn','rectificationModal','rectificationReason','createRectificationBtn'].forEach(function(id){assertTrue_(html.indexOf('id="'+id+'"')!==-1,'PV5 UI ausente: '+id);});
  assertTrue_(html.indexOf('Motivo da retificação')!==-1,'Motivo deve ser solicitado explicitamente.');
}
function testPv5CloneFailureCleanupContract_() {
  const code=String(createRectificationVersion)+String(cleanupFailedRectification_);
  assertTrue_(code.indexOf('cleanupFailedRectification_')!==-1,'Falha de cópia deve acionar limpeza.');
  ['EVENTS','AUDIT_RULE_OVERRIDES','SCHOOL_DAY_SETTINGS','HOLIDAY_OCCURRENCES','SCHOOL_DAY_EXCEPTIONS','CALENDARS'].forEach(function(name){assertTrue_(code.indexOf(name)!==-1,'Limpeza deve cobrir '+name);});
}

function testPv6AtomicPublicationContract_() {
  const code=String(publishCalendarVersion);
  assertTrue_(code.indexOf('PUBLISHED_SOURCE_CHANGED')!==-1,'PV6 deve rejeitar origem publicada divergente.');
  assertTrue_(code.indexOf('CALENDAR_VERSION_STATUS.ARCHIVED')!==-1,'Publicação nova deve arquivar a anterior.');
  assertTrue_(code.indexOf('CALENDAR_VERSION_STATUS.PUBLISHED')!==-1,'Nova versão deve se tornar publicada.');
  assertTrue_(code.indexOf('lock.waitLock')!==-1 && code.indexOf('finally')!==-1,'Transição deve ocorrer sob lock com liberação garantida.');
  assertTrue_(code.indexOf('writeCalendarVersionRowsBatch_')!==-1,'Publicação/substituição deve gravar os estados em uma única faixa, não em duas escritas independentes.');
}
function testPv6RectificationReasonPublicationUiContract_() {
  const html=HtmlService.createHtmlOutputFromFile('index').getContent();
  ['publicationOptionsModal','publishReasonCheckbox','confirmPublishBtn'].forEach(function(id){assertTrue_(html.indexOf('id="'+id+'"')!==-1,'PV6 UI ausente: '+id);});
  assertTrue_(html.indexOf('Exibir o motivo da retificação no documento publicado')!==-1,'Usuário deve decidir se o motivo aparece no documento.');
}

function testPv7SnapshotChunkingContract_() {
  assertTrue_(Array.isArray(DB_SCHEMA.VERSION_SNAPSHOT_CHUNKS),'PV7 deve possuir armazenamento chunked de snapshots.');
  assertTrue_(VERSION_SNAPSHOT_CHUNK_SIZE <= 30000,'Chunks devem ficar com folga abaixo do limite de célula do Sheets.');
  const code=String(writeVersionSnapshot_)+String(readVersionSnapshot_)+String(publishCalendarVersion);
  assertTrue_(code.indexOf('CHUNKED:PUBLICATION')!==-1,'Linha da versão deve guardar somente marcador pequeno do snapshot.');
  assertTrue_(code.indexOf('publication_snapshot_json:JSON.stringify')===-1,'PV7 não pode gravar snapshot completo em uma única célula.');
  assertTrue_(String(finalizeCalendarVersion).indexOf('finalization_report_json:JSON.stringify')===-1,'Relatório de finalização também não pode ultrapassar o limite de célula; deve ficar dentro do snapshot chunked.');
  assertTrue_(String(getFinalizationReport).indexOf("readVersionSnapshot_(id,'FINALIZATION')")!==-1,'Relatório finalizado deve ser lido do snapshot chunked.');
}
function testPv7FinalizationFreezeContract_() {
  const code=String(finalizeCalendarVersion)+String(buildFinalizationSnapshot_)+String(buildPublicationSnapshot_)+String(reopenFinalizedCalendarVersion);
  assertTrue_(code.indexOf("writeVersionSnapshot_(id,'FINALIZATION'")!==-1,'Finalizar deve congelar o estado conferido.');
  assertTrue_(String(buildPublicationSnapshot_).indexOf("readVersionSnapshot_(calendar.id,'FINALIZATION')")!==-1,'Publicação deve partir do snapshot finalizado, não recalcular o documento.');
  assertTrue_(String(reopenFinalizedCalendarVersion).indexOf("deleteVersionSnapshot_(id,'FINALIZATION')")!==-1,'Reabrir deve invalidar o snapshot finalizado.');
  const reopenCode=String(reopenFinalizedCalendarVersion);assertTrue_(reopenCode.indexOf('status:CALENDAR_VERSION_STATUS.DRAFT')<reopenCode.indexOf("deleteVersionSnapshot_(id,'FINALIZATION')"),'Reabrir deve primeiro tornar a versão editável e só depois apagar o congelamento, evitando FINALIZADO sem snapshot em falha intermediária.');
}
function testPv7MutationGuardCoverageContract_() {
  [saveEvent,saveEventsBatch,deleteEvent,saveCalendarTitle,saveSchoolDaySettings,setCalendarAuditRuleIgnored,saveHoliday,importNationalHolidays,deleteHoliday,saveHolidayOccurrence,deleteHolidayOccurrence,saveSchoolDayException,deleteSchoolDayException,setCalendarTheme].forEach(function(fn){assertTrue_(String(fn).indexOf('calendarVersionMutationFailure_')!==-1,fn.name+' deve rejeitar mutação da versão fora de RASCUNHO.');});
  // PV22: Temas são catálogo global; salvar/excluir Tema não é mutação de versão.
  [saveTheme,deleteTheme].forEach(function(fn){assertTrue_(String(fn).indexOf('calendarVersionMutationFailure_')===-1,fn.name+' não deve depender do estado de uma versão do calendário.');});
  const importCode=String(importNationalHolidays);assertTrue_(importCode.indexOf('calendarVersionMutationFailure_')<importCode.indexOf('fetchNationalHolidaySource_'),'Importação deve bloquear antes de buscar/mutar dados.');
}
function testPv7UiAvailabilityAndReadOnlyContract_() {
  const html=HtmlService.createHtmlOutputFromFile('index').getContent();
  assertTrue_(html.indexOf("el.toolsBtn.disabled=!draft")!==-1,'Ferramentas de mutação devem existir somente no rascunho.');
  assertTrue_(html.indexOf("selectable: isCurrentVersionEditable()")!==-1,'Seleção deve respeitar estado editável.');
  assertTrue_(html.indexOf("editable: isCurrentVersionEditable()")!==-1,'Drag/drop deve respeitar estado editável.');
  ['createProjectFromModal','openVersionFromModal','finalizeCurrentVersion','reopenCurrentVersion','createRectificationFromModal','executePublication'].forEach(function(name){const start=html.indexOf('function '+name);assertTrue_(start!==-1,'Fluxo UI ausente: '+name);const slice=html.slice(start,start+2200);assertTrue_(slice.indexOf('setSaving(false)')!==-1,name+' deve liberar proteção após operação.');});
  assertTrue_(html.indexOf('.getEventTypesAdminData(state.calendarRecord.id)')!==-1,'CRUD de Tipos de Evento deve carregar o contexto da versão aberta, não o calendário legado fixo.');
}

function testPv7MeasuredProgressContract_() {
  const html=HtmlService.createHtmlOutputFromFile('index').getContent();
  ['feedbackProgress','feedbackProgressBar','feedbackProgressCopy'].forEach(function(id){assertTrue_(html.indexOf('id="'+id+'"')!==-1,'Progresso mensurável ausente no painel único de feedback: '+id);});
  assertTrue_(html.indexOf('function beginMeasuredOperation')!==-1 && html.indexOf('function pollMeasuredOperationProgress')!==-1,'Operações longas devem consultar progresso do backend.');
  assertTrue_(html.indexOf('.getOperationProgress(token)')!==-1,'Frontend deve consultar o progresso por token.');
  const pollStart=html.indexOf('function pollMeasuredOperationProgress');const pollStop=html.indexOf('function beginMeasuredOperation',pollStart);assertTrue_(html.slice(pollStart,pollStop).indexOf('setInterval(')===-1,'Polling de progresso deve usar setTimeout recursivo; watchdogs de ciclo podem usar timer próprio.');
  const server=String(updateOperationProgress_)+String(getOperationProgress)+String(finalizeCalendarVersion)+String(createRectificationVersion)+String(publishCalendarVersion);
  assertTrue_(server.indexOf('CacheService.getScriptCache')!==-1,'Backend deve expor progresso real por fases via cache de operação.');
  ['Finalização concluída','Nova versão conferida e pronta para edição','Publicação concluída'].forEach(function(label){assertTrue_(server.indexOf(label)!==-1,'Fase final de progresso ausente: '+label);});
}

function testPv7ErrorInductionInvariantContract_() {
  let failed=false;try{assertProjectVersionInvariants_('P',[{project_id:'P',version_number:1,status:'PUBLICADO',published_at:'x'},{project_id:'P',version_number:2,status:'PUBLICADO',published_at:'y'}]);}catch(e){failed=true;}assertTrue_(failed,'Erro induzido: duas publicações devem falhar.');
  failed=false;try{assertProjectVersionInvariants_('P',[{project_id:'P',version_number:1,status:'ARQUIVADO'}]);}catch(e){failed=true;}assertTrue_(failed,'Erro induzido: arquivado nunca publicado deve falhar.');
  failed=false;try{assertProjectVersionInvariants_('P',[{project_id:'P',version_number:1,status:'RASCUNHO'},{project_id:'P',version_number:2,status:'FINALIZADO'}]);}catch(e){failed=true;}assertTrue_(failed,'Erro induzido: duas versões em elaboração devem falhar.');
  failed=false;try{assertProjectVersionInvariants_('P',[{id:'V1',project_id:'P',version_number:1,status:'PUBLICADO',published_at:'x'},{id:'V2',project_id:'P',version_number:2,status:'RASCUNHO',source_version_id:'INEXISTENTE'}]);}catch(e){failed=true;}assertTrue_(failed,'Erro induzido: retificação com origem inexistente deve falhar.');
  const rectCode=String(createRectificationVersion);assertTrue_(rectCode.indexOf("active_calendar_id:sourceId")!==-1 && rectCode.indexOf('setUserActiveCalendarId_(sourceId)')!==-1,'Falha induzida após ativar retificação deve restaurar Projeto e a preferência ativa do usuário para a publicação de origem.');
  const projectCode=String(createCalendarProject);assertTrue_(projectCode.indexOf("getRequiredSheet_('PROJECTS')")!==-1 && projectCode.indexOf('deleteRowsMatching_')!==-1,'Falha parcial ao criar Projeto deve limpar a unidade lógica incompleta.');
}

function testPv8ProjectsTabsContract_() {
  const html=HtmlService.createHtmlOutputFromFile('index').getContent();
  ['projectsTabs','projectsTabProjects','projectsTabVersions','projectsPanelProjects','projectsPanelVersions'].forEach(function(id){
    assertTrue_(html.indexOf('id="'+id+'"')!==-1,'PV8 deve possuir a estrutura de abas de Projetos e versões: '+id+'.');
  });
  assertTrue_(html.indexOf('role="tablist" aria-label="Projetos e versões"')!==-1,'Projetos e versões deve usar semântica acessível de tablist.');
  assertTrue_(html.indexOf('class="projects-layout"')===-1,'PV8 não deve voltar ao layout dividido em duas colunas.');
  assertTrue_(html.indexOf('function activateProjectsTab')!==-1 && html.indexOf('function bindProjectsTabs')!==-1,'PV8 deve controlar as abas por um fluxo único.');
  assertTrue_(html.indexOf("activateProjectsTab('projectsPanelVersions',false)")!==-1,'Selecionar um Projeto deve levar diretamente às versões daquele Projeto.');
  assertTrue_(html.indexOf("openProjectsModal('projectsPanelVersions')")!==-1,'O badge da versão deve abrir diretamente a aba de versões.');
  ['ArrowRight','ArrowLeft','Home','End'].forEach(function(key){assertTrue_(html.indexOf("event.key === '"+key+"'")!==-1,'Navegação por teclado das abas deve suportar '+key+'.');});
}

function testPv8HeaderActionsAndSettingsContract_() {
  const html=HtmlService.createHtmlOutputFromFile('index').getContent();
  assertTrue_(html.indexOf('class="topbar-actions"')!==-1,'Ações contextuais devem formar um grupo alinhado à direita do cabeçalho.');
  assertTrue_(html.indexOf('.topbar-actions {')!==-1 && html.indexOf('margin-left:auto')!==-1,'Grupo de ações deve permanecer à direita, separado da identidade do Projeto.');
  ['versionPrimaryAction','projectContextBtn','toolsBtn'].forEach(function(id){const at=html.indexOf('id="'+id+'"');assertTrue_(at!==-1,'Ação principal ausente no cabeçalho: '+id+'.');const slice=html.slice(Math.max(0,at-420),at+900);assertTrue_(slice.indexOf('<svg')!==-1,'A ação '+id+' deve ter ícone representativo junto do texto.');});
  assertTrue_(html.indexOf('>Configurações</span>')!==-1,'O menu de três pontos deve ser substituído pelo rótulo textual Configurações.');
  assertTrue_(html.indexOf('aria-label="Configurações"')!==-1,'O painel lateral deve assumir explicitamente o nome Configurações.');
  assertTrue_(html.indexOf('⋮')===-1,'PV8 não deve reintroduzir o menu ambíguo de três pontos.');
  assertTrue_(html.indexOf('id="versionPrimaryActionLabel"')!==-1 && html.indexOf("el.versionPrimaryActionLabel.textContent=draft?'Finalizar':'Publicar'")!==-1,'Troca Finalizar/Publicar deve preservar o ícone e alterar somente o rótulo.');
  ['eventTypesToolBtn','schoolDaysToolBtn','holidaysToolBtn','themesToolBtn'].forEach(function(id){const at=html.indexOf('id="'+id+'"');const slice=html.slice(at,at+800);assertTrue_(at!==-1 && slice.indexOf('<svg')!==-1,'Cada item principal de Configurações deve ter ícone consistente: '+id+'.');});
}

function testPv8WeekdayHeaderTypographyContract_() {
  const html=HtmlService.createHtmlOutputFromFile('index').getContent();
  assertTrue_(html.indexOf("dayHeaderClass: function(info) { return calendarThemeDayClasses_('ca-calendar-grid-day-header', info); }")!==-1,'Cabeçalho dos dias deve continuar usando o hook público da FullCalendar v7, agora incluindo o estado temático de fim de semana.');
  const start=html.indexOf('.ca-calendar-grid-day-header {');
  const end=html.indexOf('}',start);
  const css=html.slice(start,end+1);
  assertTrue_(css.indexOf('text-align: center;')!==-1,'Nomes dos dias da semana devem ficar centralizados.');
  assertTrue_(css.indexOf('font-weight: 800;')!==-1,'Nomes dos dias da semana devem ficar em negrito.');
  assertTrue_(css.indexOf('font-size: 13px;')!==-1,'Nomes dos dias da semana devem receber fonte discretamente ampliada.');
  assertTrue_(html.indexOf('.toolbar-title { font-size:20px;')!==-1,'Nome do mês deve permanecer visualmente maior que os dias da semana.');
}


function testPv14RecessoAndUberlandiaSeedContract_() {
  const recess = DEFAULT_EVENT_TYPES.find(function(item){ return item[0] === 'RECESSO'; });
  assertTrue_(!!recess, 'SETUP deve pré-cadastrar o Tipo de Evento Recesso.');
  assertEquals_('Recesso', recess[1], 'Nome inicial deve ser Recesso.');
  assertTrue_(recess[2] === true && recess[3] === false, 'Recesso deve admitir um dia ou intervalo: início obrigatório e término opcional.');
  assertTrue_(recess[4] === false, 'Recesso não deve delimitar período letivo.');
  assertEquals_('NAO_LETIVO',recess[6],'Recesso deve retirar dias da malha letiva.');
  assertTrue_(!DEFAULT_ACADEMIC_AUDIT_RULES.RECESSO,'Recesso deve continuar fora da Checklist padrão.');
  assertTrue_(String(migrateSchoolDayEffects_).indexOf("code === 'RECESSO'") !== -1, 'Atualização deve completar Recesso legado sem efeito letivo preenchido.');
  assertEquals_('ATENCAO', defaultVisualRoleForEventType_('RECESSO',0), 'Recesso deve usar papel visual ATENCAO por padrão.');

  assertEquals_(4, DEFAULT_UBERLANDIA_HOLIDAYS.length, 'SETUP deve garantir quatro feriados municipais de Uberlândia.');
  const abadia=DEFAULT_UBERLANDIA_HOLIDAYS.find(function(item){return item.name==='Nossa Senhora da Abadia';});
  const aniversario=DEFAULT_UBERLANDIA_HOLIDAYS.find(function(item){return item.name.indexOf('São Raimundo')===0;});
  const paixao=DEFAULT_UBERLANDIA_HOLIDAYS.find(function(item){return item.name==='Paixão de Cristo';});
  const corpus=DEFAULT_UBERLANDIA_HOLIDAYS.find(function(item){return item.name==='Corpus Christi';});
  assertTrue_(!!abadia && abadia.scope==='MUNICIPAL' && abadia.nature==='FIXO' && abadia.month===8 && abadia.day===15, 'Nossa Senhora da Abadia deve ser municipal fixa em 15/08.');
  assertTrue_(!!aniversario && aniversario.scope==='MUNICIPAL' && aniversario.nature==='FIXO' && aniversario.month===8 && aniversario.day===31, 'São Raimundo / Aniversário de Uberlândia deve ser municipal fixo em 31/08.');
  assertTrue_(!!paixao && paixao.nature==='VARIAVEL', 'Paixão de Cristo deve permanecer variável por ano.');
  assertTrue_(!!corpus && corpus.nature==='VARIAVEL', 'Corpus Christi deve permanecer variável por ano.');
  assertTrue_(DEFAULT_UBERLANDIA_HOLIDAYS.every(function(item){return item.scope!=='ESTADUAL';}), 'Não deve ser inventado feriado estadual ausente da fonte oficial utilizada.');
  assertTrue_(holidaySeedMatches_({name:'Aniversário de Uberlândia',scope:'MUNICIPAL',nature:'FIXO',month:8,day:31}, aniversario), 'Seed municipal deve reconhecer alias e evitar duplicação.');
  assertTrue_(String(runSetupMenuStep_).indexOf('seedUberlandiaHolidayCatalog_') !== -1, 'SETUP UPDATE/RESET deve validar o catálogo municipal.');
}


function testPv15ProjectReconciliationAndWatchdogContract_() {
  const html=HtmlService.createHtmlOutputFromFile('index').getContent();
  const createCode=String(createCalendarProject);
  assertTrue_(createCode.indexOf('projectId: projectId')!==-1 && createCode.indexOf('calendarId: calendarId')!==-1,'Criação de Projeto deve devolver IDs explícitos para reconciliação do frontend.');
  assertTrue_(html.indexOf('function reconcileCreatedProjectWorkspace_')!==-1,'PV15 deve reconciliar explicitamente a Gaveta após criar o primeiro Projeto.');
  assertTrue_(html.indexOf('.getProjectsWorkspaceData()')!==-1,'Após criar Projeto, frontend deve fazer releitura canônica da Gaveta em nova chamada ao backend.');
  const createAt=html.indexOf('function createProjectFromModal()');
  const openAt=html.indexOf('function openVersionFromModal',createAt);
  const flow=html.slice(createAt,openAt);
  assertTrue_(flow.indexOf('getProjectsWorkspaceData')!==-1,'Fluxo de criação deve reler Projetos antes do sucesso.');
  assertTrue_(flow.indexOf("showFeedback('Projeto criado. A Versão 1 está pronta para edição.'") > flow.indexOf('closeProjectsModal()'),'Sucesso só deve aparecer depois de reconciliar e fechar a Gaveta.');
  assertTrue_(html.indexOf('id="feedbackTitle"')!==-1 && html.indexOf('id="feedbackIcon"')!==-1,'Watchdog global deve ter título e ícone, não apenas texto solto.');
  assertTrue_(html.indexOf('z-index:320')!==-1,'Watchdog global deve permanecer em primeiro plano, inclusive sobre modais.');
  assertTrue_(html.indexOf("el.feedback.focus({preventScroll:true})")!==-1,'Mensagem global relevante deve entrar no campo de visão/foco acessível.');
}

function testPv15SettingsCrudProfessionalContract_() {
  const html=HtmlService.createHtmlOutputFromFile('index').getContent();
  ['eventTypeAdminSearch','holidayAdminSearch','themeAdminSearch'].forEach(function(id){assertTrue_(html.indexOf('id="'+id+'"')!==-1,'CRUD profissional deve oferecer busca contextual: '+id+'.');});
  assertTrue_(html.indexOf('.settings-list-toolbar {')!==-1 && html.indexOf('.settings-search {')!==-1,'CRUDs de Configurações devem usar toolbar comum com busca e ações.');
  assertTrue_(html.indexOf('.event-type-row-copy { display:grid;')!==-1,'Nome e metadados devem possuir hierarquia em linhas separadas, evitando concatenação visual.');
  assertTrue_(html.indexOf('event-type-row-detail')!==-1,'Itens de configuração devem expor metadados secundários legíveis.');
  assertTrue_(html.indexOf('className=\'theme-palette\'')!==-1,'Lista de Temas deve mostrar amostra visual da paleta.');
  ['el.eventTypeAdminSearch.addEventListener(\'input\', renderEventTypeList)','el.holidayAdminSearch.addEventListener(\'input\', renderHolidayList)','el.themeAdminSearch.addEventListener(\'input\', renderThemeList)'].forEach(function(contract){assertTrue_(html.indexOf(contract)!==-1,'Busca administrativa deve filtrar em tempo real.');});
  const eventModal=html.slice(html.indexOf('id="eventTypesModal"'),html.indexOf('id="schoolDayModal"'));
  const holidayModal=html.slice(html.indexOf('id="holidaysModal"'),html.indexOf('id="themesModal"'));
  assertTrue_(eventModal.indexOf('id="eventTypeFeedback"') < eventModal.indexOf('class="admin-body"'),'Feedback de Tipos deve ficar visível tanto na lista quanto no editor.');
  assertTrue_(holidayModal.indexOf('id="holidayFeedback"') < holidayModal.indexOf('class="admin-body"'),'Feedback de Feriados deve ficar visível tanto na lista quanto no editor.');
  assertTrue_(html.indexOf('.theme-palette i {')!==-1,'Amostra de Tema deve ter swatches de cor consistentes.');
}


function testPv17SingleContextFeedbackContract_() {
  const html=HtmlService.createHtmlOutputFromFile('index').getContent();
  assertTrue_(html.indexOf('id="operationShield" hidden aria-hidden="true"></div>')!==-1,'Shield deve ser apenas proteção, sem cartão concorrente de comunicação.');
  assertTrue_(html.indexOf('class="operation-card"')===-1,'PV17 não pode reintroduzir uma segunda tela de progresso sobre a comunicação contextual.');
  assertTrue_(html.indexOf('id="drawerFeedback"')!==-1,'Editor de Evento deve possuir sua própria barra de comunicação contextual.');
  assertTrue_(html.indexOf('function currentContextFeedbackTarget_')!==-1,'Feedback deve resolver o contexto visual ativo.');
  assertTrue_(html.indexOf("if (el.eventDrawer && el.eventDrawer.classList.contains('open')) return el.drawerFeedback")!==-1,'Mensagens do drawer devem permanecer no próprio editor.');
  assertTrue_(html.indexOf('function updateContextFeedback')!==-1 && html.indexOf('function updateGlobalFeedback')!==-1,'Sistema deve ter um único contrato de feedback contextual/global.');
  const eventStart=html.indexOf('function submitEvent(event)');
  const eventEnd=html.indexOf('function submitVariableHolidayFromEditor()',eventStart);
  const eventFlow=html.slice(eventStart,eventEnd);
  assertTrue_(eventFlow.indexOf("updateContextFeedback(el.drawerFeedback,'processing'")!==-1,'Salvamento deve atualizar dinamicamente a mesma barra do Editor.');
  assertTrue_(eventFlow.indexOf("updateContextFeedback(el.drawerFeedback,'success'")!==-1,'Conclusão deve ocorrer na mesma barra do Editor.');
  assertTrue_(eventFlow.indexOf('closeDrawer();')===-1,'Editor não deve ser fechado antes de o usuário receber a conclusão no mesmo contexto.');
  assertFalse_(eventFlow.indexOf("showFeedback('Salvando evento na base compartilhada…'")!==-1,'Não deve existir mensagem intermediária classificada como Concluído.');
}

function testPv17EventSaveCanonicalLockContract_() {
  const source=String(saveEvent);
  const lockPos=source.indexOf('lock.waitLock(7000)');
  const calendarPos=source.indexOf('calendar = getCalendarById_');
  const guardPos=source.indexOf('calendarVersionMutationFailure_(calendar)');
  const writePos=Math.min.apply(null,[source.indexOf('writeObjectToRow_'),source.indexOf('appendObject_')].filter(function(x){return x>=0;}));
  assertTrue_(lockPos!==-1 && calendarPos>lockPos,'saveEvent deve resolver a versão canônica somente depois de adquirir ScriptLock.');
  assertTrue_(guardPos>calendarPos && guardPos<writePos,'Existência/status da versão devem ser revalidados no mesmo lock antes de qualquer escrita.');
  assertTrue_(String(calendarVersionMutationFailure_).indexOf("typeof calendarOrId === 'object'")!==-1,'Guard deve aceitar registro canônico para evitar segunda leitura redundante.');
  assertTrue_(source.indexOf('EVENT_CALENDAR_MISMATCH')!==-1,'Edição deve rejeitar evento pertencente a outra versão antes de escrever.');
}

function testPv17PreviewPeriodEndpointsAndDateRangeContract_() {
  const theme={pageBg:'#fff',surfaceBg:'#fff',textColor:'#111',mutedColor:'#555',accentColor:'#287a3f',eventColors:['#287a3f','#176b87','#a96711','#7a4b92','#a63b3b','#5b6570'],showWeeklyTotals:false,weeklyTotalsPosition:'LAST',monthlyTotalPosition:'AFTER_TABLE',monthEventsLayout:'SIDE_BY_SIDE'};
  const event={id:'P1',eventTypeId:'T1',title:'Período de Férias Docentes',startDate:'2026-01-02',endDate:'2026-01-31'};
  const html=buildPreviewMonth_(2026,1,[event],{dates:[],byMonth:{}},{holidays:[],occurrences:[]},[],theme,{T1:{visualRole:'ATENCAO',schoolPeriod:false}});
  assertTrue_(html.indexOf('<time>02–31</time>')!==-1,'Lista mensal deve mostrar início e fim do período.');
  assertTrue_(html.indexOf('Fim · Período de Férias Docentes')!==-1,'Grade deve identificar explicitamente o marcador final.');
  const occurrences=(html.match(/title="Período de Férias Docentes"/g)||[]).length;
  assertEquals_(1,occurrences,'Título original deve aparecer como marcador inicial uma única vez; dias intermediários não devem ser coloridos.');
  assertTrue_(html.indexOf('addRange_')===-1,'HTML renderizado não deve depender de faixa contínua de dias intermediários.');
  const openEnded={id:'P2',eventTypeId:'T1',title:'Evento aberto',startDate:'2026-01-12',endDate:''};
  const openHtml=buildPreviewMonth_(2026,1,[openEnded],{dates:[],byMonth:{}},{holidays:[],occurrences:[]},[],theme,{T1:{visualRole:'ATENCAO',schoolPeriod:false}});
  assertTrue_(openHtml.indexOf('<time>12</time>')!==-1,'Evento sem término deve exibir somente a data inicial, sem inventar data final.');
}

function testPv17PreviewPageOverflowContract_() {
  const css=previewCss_({monthsPerPage:1,pageBg:'#fff',surfaceBg:'#fff',textColor:'#111',mutedColor:'#555',accentColor:'#287a3f'});
  assertTrue_(css.indexOf('.preview-day-events{')!==-1 && css.indexOf('max-height:15px')!==-1,'Marcadores da célula devem ter altura limitada para não expandir linhas da grade.');
  assertTrue_(css.indexOf('.calendar-box tbody tr:not(.weekly){height:45px}')!==-1,'Linhas do mês devem manter altura física previsível no layout de 1 mês.');
  assertTrue_(css.indexOf('.month-layout{min-height:0;overflow:visible}')!==-1,'Impressão não pode cortar conteúdo excedente por overflow hidden.');
  assertTrue_(css.indexOf('max-height:'+"'"+'+printHeight')===-1,'CSS materializado não deve conter fragmentos de concatenação inválidos.');
  assertTrue_(css.indexOf('max-height:291mm')!==-1,'Página A4 retrato deve possuir altura máxima física explícita com margem técnica de 3 mm.');
  const many=[]; for(let i=1;i<=24;i++)many.push({id:'E'+i,eventTypeId:'T',title:'Evento '+i,startDate:'2026-01-'+String((i%28)+1).padStart(2,'0'),endDate:''});
  const theme={pageBg:'#fff',surfaceBg:'#fff',textColor:'#111',mutedColor:'#555',accentColor:'#287a3f',eventColors:['#287a3f','#176b87','#a96711','#7a4b92','#a63b3b','#5b6570'],showWeeklyTotals:false,weeklyTotalsPosition:'LAST',monthlyTotalPosition:'AFTER_TABLE',monthEventsLayout:'SIDE_BY_SIDE'};
  const html=buildPreviewMonth_(2026,1,many,{dates:[],byMonth:{}},{holidays:[],occurrences:[]},[],theme,{T:{visualRole:'PRINCIPAL',schoolPeriod:false}});
  assertTrue_(html.indexOf('data-event-count="24"')!==-1 && html.indexOf('data-event-scale=')!==-1,'Meses com muitos eventos devem manter metadados mensuráveis de densidade sem crescer verticalmente sem limite.');
}

function testPv17AcademicWeekAndEventsDiversosSeedContract_() {
  const diverse=DEFAULT_EVENT_TYPES.find(function(item){return item[0]==='EVENTOS_DIVERSOS';});
  assertTrue_(!!diverse,'SETUP deve pré-cadastrar Eventos Diversos.');
  assertTrue_(diverse[2]===true && diverse[3]===false,'Eventos Diversos deve exigir início e permitir término opcional.');
  assertTrue_(diverse[4]===false,'Eventos Diversos não delimita malha letiva.');
  assertEquals_('NEUTRO',diverse[6],'Eventos Diversos deve permanecer neutro para a malha letiva.');
  assertTrue_(!DEFAULT_ACADEMIC_AUDIT_RULES.EVENTOS_DIVERSOS,'Eventos Diversos não deve nascer como obrigação regulatória.');
  const createSource=String(createCalendarProject);
  assertTrue_(createSource.indexOf("if (kind === 'ACADEMICO')")!==-1,'Projeto acadêmico deve receber semana letiva inicial automática.');
  ['monday: true','tuesday: true','wednesday: true','thursday: true','friday: true','saturday: false','sunday: false'].forEach(function(fragment){assertTrue_(createSource.indexOf(fragment)!==-1,'Semana acadêmica padrão incompleta: '+fragment);});
  assertTrue_(createSource.indexOf("kind === 'ADMINISTRATIVO'")===-1 || createSource.indexOf("if (kind === 'ACADEMICO')")!==-1,'Calendário administrativo não deve receber semana-base obrigatória.');
}


function testPv17DeletedVersionNoPartialWrite_() {
  setup('TEST');
  const calendarId='CAL-PV17-DELETED-'+Utilities.getUuid().replace(/-/g,'').slice(0,8);
  appendTestAcademicCalendar_(calendarId,'Versão removida para erro induzido');
  const type=listEventTypesForCalendarKind_('ACADEMICO',true)[0];
  assertTrue_(!!type,'Erro induzido requer ao menos um Tipo de Evento acadêmico.');
  const before=readTable_(getRequiredSheet_('EVENTS')).length;
  forceDeleteTestCalendar_(calendarId);
  const result=saveEvent({calendarId:calendarId,eventTypeId:type.id,title:'Não deve ser gravado',startDate:'2099-01-10',endDate:'',notes:'',version:0,auditYear:2099});
  const after=readTable_(getRequiredSheet_('EVENTS')).length;
  assertFalse_(result.ok,'Versão removida antes da mutação deve ser rejeitada.');
  assertEquals_('CALENDAR_NOT_FOUND',result.code,'Erro induzido deve preservar código semântico de versão inexistente.');
  assertEquals_(before,after,'Nenhuma escrita parcial pode ocorrer quando a versão não existe mais.');
}


function testPv18PrintThemeFidelityContract_() {
  const theme={pageBg:'#ffffff',surfaceBg:'#ffffff',textColor:'#111111',mutedColor:'#555555',accentColor:'#287a3f',eventColors:['#ff1493','#176b87','#a96711','#7a4b92','#a63b3b','#5b6570'],calendarEventDisplay:'NAMES',monthsPerPage:12,pageOrientation:'LANDSCAPE',monthEventsLayout:'SIDE_BY_SIDE',showWeeklyTotals:true,weeklyTotalsPosition:'LAST',monthlyTotalPosition:'AFTER_TABLE'};
  const typeMap={PER:{visualRole:'PRINCIPAL',schoolPeriod:false}};
  const events=[
    {eventTypeId:'PER',title:'Período de Férias Docentes',startDate:'2026-01-02',endDate:'2026-01-31'},
    {eventTypeId:'PER',title:'Aula inaugural',startDate:'2026-01-07',endDate:''}
  ];
  const month=buildPreviewMonth_(2026,1,events,{dates:[],byMonth:{}},{holidays:[],occurrences:[]},[],theme,typeMap);
  assertTrue_(month.indexOf('Eventos do mês')!==-1,'Lista de eventos deve integrar o HTML impresso.');
  assertTrue_(month.indexOf('02–31')!==-1,'Período deve mostrar início e fim na lista.');
  assertTrue_(month.indexOf('>07<')!==-1,'Evento pontual deve mostrar apenas a data inicial.');
  assertEquals_(3,(month.match(/preview-day-event label/g)||[]).length,'A grade deve conter somente início/fim do período e o evento pontual, sem dias intermediários.');
  const css=previewCss_(theme);
  assertTrue_(css.indexOf('@page{size:297mm 210mm;margin:3mm}')!==-1,'12 meses por página deve respeitar A4 paisagem com margem mínima explícita.');
  assertTrue_(css.indexOf('.event-list{min-height:0;overflow:visible}')!==-1,'Impressão não pode ocultar a lista de eventos por overflow.');
  assertTrue_(css.indexOf('print-color-adjust:exact!important')!==-1,'Impressão deve preservar cores literais do Tema.');
  assertEquals_(4,previewPageColumnCount_(12),'12 meses devem usar quatro colunas.');
  assertEquals_(3,previewPageRowCount_(12),'12 meses devem usar três linhas.');
}


function testPv23PrintOrientationAndMarginsContract_() {
  const base={pageBg:'#ffffff',surfaceBg:'#ffffff',textColor:'#111111',mutedColor:'#555555',accentColor:'#287a3f',monthEventsLayout:'SIDE_BY_SIDE',monthsPerPage:1};
  let profile=previewPrintProfile_(Object.assign({},base,{pageOrientation:'PORTRAIT'}),['<article data-event-count="3"></article>']);
  assertEquals_('portrait',profile.orientation,'Tema em Retrato deve permanecer em retrato.');
  assertEquals_(3,profile.marginMm,'Impressão deve usar a margem técnica mínima definida pelo projeto.');
  assertEquals_(204,profile.contentWidthMm,'A4 retrato com margem de 3 mm deve deixar 204 mm úteis.');
  assertEquals_(291,profile.contentHeightMm,'A4 retrato com margem de 3 mm deve deixar 291 mm úteis.');

  profile=previewPrintProfile_(Object.assign({},base,{pageOrientation:'PORTRAIT'}),['<article data-event-count="99"></article>']);
  assertEquals_('portrait',profile.orientation,'Densidade extrema não pode trocar a orientação escolhida no Tema.');

  profile=previewPrintProfile_(Object.assign({},base,{monthsPerPage:12,pageOrientation:'PORTRAIT'}),[]);
  assertEquals_('portrait',profile.orientation,'Quantidade de meses por página não pode trocar Retrato para Paisagem.');

  profile=previewPrintProfile_(Object.assign({},base,{monthsPerPage:1,pageOrientation:'LANDSCAPE'}),[]);
  assertEquals_('landscape',profile.orientation,'Tema em Paisagem deve permanecer em paisagem mesmo com um único mês.');
  assertEquals_(291,profile.contentWidthMm,'A4 paisagem deve disponibilizar 291 mm úteis.');
  assertEquals_(204,profile.contentHeightMm,'A4 paisagem deve disponibilizar 204 mm úteis.');

  const css=previewCss_(Object.assign({},base,{monthsPerPage:12,pageOrientation:'LANDSCAPE'}),previewPrintProfile_(Object.assign({},base,{monthsPerPage:12,pageOrientation:'LANDSCAPE'}),[]));
  assertTrue_(css.indexOf('@page{size:297mm 210mm;margin:3mm}')!==-1,'PDF deve materializar dimensões físicas A4 paisagem e margem de 3 mm conforme o Tema.');
  assertTrue_(css.indexOf('width:291mm')!==-1 && css.indexOf('height:204mm')!==-1,'Área de conteúdo deve coincidir com a caixa imprimível calculada.');
}

function testR6ExplicitThemePageOrientationContract_() {
  const base=generateThemeSuggestion(71).theme;
  assertEquals_('LANDSCAPE',base.pageOrientation,'Novo Tema sugerido deve nascer com orientação explícita.');
  ['PORTRAIT','LANDSCAPE'].forEach(function(value){
    const result=validateThemePayload_(Object.assign({},base,{name:'Orientação '+value,pageOrientation:value}));
    assertTrue_(result.ok,value+' deve ser uma orientação válida do Tema.');
    const row=themeClientToRow_(result.theme);
    assertEquals_(value,row.page_orientation,'Orientação deve ser persistida na tabela THEMES.');
    assertEquals_(value,themeRowToClient_(row).pageOrientation,'Orientação deve sobreviver ao round-trip do Tema.');
  });
  const invalid=validateThemePayload_(Object.assign({},base,{name:'Orientação automática inválida',pageOrientation:'AUTO'}));
  assertFalse_(invalid.ok,'Modo automático não deve ser aceito: a orientação é responsabilidade do usuário.');

  const portrait=previewPrintProfile_(Object.assign({},base,{monthsPerPage:12,pageOrientation:'PORTRAIT'}),['<article data-event-count="500"></article>']);
  assertEquals_('portrait',portrait.orientation,'REGRA-086 não pode alterar a orientação explícita nem sob densidade extrema.');
  const landscape=previewPrintProfile_(Object.assign({},base,{monthsPerPage:1,pageOrientation:'LANDSCAPE'}),[]);
  assertEquals_('landscape',landscape.orientation,'Um mês por página não pode forçar Retrato se o Tema definiu Paisagem.');

  const legacyPortrait=previewPrintProfile_({monthsPerPage:1,monthEventsLayout:'SIDE_BY_SIDE'},['<article data-event-count="2"></article>']);
  assertEquals_('portrait',legacyPortrait.orientation,'Snapshot legado sem orientação deve conservar a heurística histórica para não ser reinterpretado.');
  assertFalse_(legacyPortrait.explicitOrientation,'Compatibilidade legada deve ser identificável no perfil.');

  const html=HtmlService.createHtmlOutputFromFile('index').getContent();
  assertTrue_(html.indexOf('id="themePageOrientation"')!==-1,'Editor de Tema deve expor a orientação da página.');
  assertTrue_(html.indexOf('<option value="PORTRAIT">Retrato</option>')!==-1 && html.indexOf('<option value="LANDSCAPE">Paisagem</option>')!==-1,'Editor deve oferecer somente Retrato e Paisagem.');
  assertTrue_(DB_SCHEMA.THEMES.indexOf('page_orientation')!==-1,'Schema THEMES deve persistir page_orientation.');
  assertTrue_(/^0\.0\.5-beta\d+-pv\d+$/.test(String(SCHEMA_VERSION)),'Schema deve permanecer na linha PV após persistir orientação de Tema.');
}

function testR7PreviewPdfAbandonLifecycleContract_() {
  const html=HtmlService.createHtmlOutputFromFile('index').getContent();
  assertTrue_(html.indexOf('function installPreviewAbandonSignal_')!==-1,'Prévia precisa de sinal direto de abandono para a janela principal.');
  assertTrue_(html.indexOf("win.addEventListener('pagehide',notify")!==-1,'Fechamento/pagehide da Prévia deve notificar cancelamento diretamente.');
  assertTrue_(html.indexOf("win.addEventListener('beforeunload',notify")!==-1,'beforeunload deve atuar como segunda via de aviso da janela filha.');
  assertTrue_(html.indexOf('window.notifyPreviewAbandoned_=notifyPreviewAbandoned_')!==-1,'Janela principal deve expor receptor explícito do abandono da Prévia.');
  assertTrue_(html.indexOf("window.addEventListener('focus', reconcileOperationLifecycle_)")!==-1,'Ao recuperar foco, a mesa deve reconciliar operações que perderam a janela filha.');
  assertTrue_(html.indexOf("document.addEventListener('visibilitychange'")!==-1,'Ao voltar à aba, a mesa deve reconciliar o ciclo de operação.');
  assertTrue_(html.indexOf('function startOperationWatchdog_')!==-1,'Operações canceláveis precisam de watchdog independente do polling da janela.');
  assertTrue_(html.indexOf("forceReleaseStaleOperation_('A operação ativa perdeu seu contexto.')")!==-1,'Estado impossível deve liberar a interface em vez de permanecer inert.');
  assertTrue_(html.indexOf("{kind:'PREVIEW',windowRef:previewWindow,cancelOnWindowClose:true}")!==-1,'Abertura da Prévia deve registrar sua janela no ciclo da operação.');
  assertTrue_(html.indexOf("{kind:'PREVIEW_PDF',windowRef:previewWindow,cancelOnWindowClose:true}")!==-1,'PDF iniciado na Prévia deve herdar o vínculo com a janela e cancelar ao abandoná-la.');
  assertTrue_(html.indexOf("const savingMessage=(message===undefined||message===null)?'Processando…':String(message);")!==-1,'Mensagem vazia da Prévia deve permanecer vazia para não reabrir feedback global sobre a mesa.');
  assertTrue_(html.indexOf('clearOperationLifecycleTimers_();')!==-1 && html.indexOf('state.activeOperationMeta=null;')!==-1,'Desbloqueio deve limpar timers e metadados de ciclo de vida centralmente.');
  assertTrue_(html.indexOf('.operation-shield.cancelable .operation-cancel-card{display:flex!important}')!==-1,'Comando Cancelar da Prévia deve possuir regra visual própria acima do bloqueio.');
}

function testR8PreviewPrintParityAndSchoolPeriodMarkersContract_() {
  const preview=String(buildLivePreviewHtml_);
  assertTrue_(preview.indexOf('data-render-source="print-pages"')!==-1,'SCREEN deve renderizar exatamente as páginas físicas da REGRA-086.');
  assertFalse_(preview.indexOf('screenPages')!==-1 || preview.indexOf('screen-preview-page')!==-1,'Prévia não pode manter uma segunda árvore de páginas independente.');
  assertTrue_(preview.indexOf('data-screen-scale')!==-1 && preview.indexOf('getBoundingClientRect().width')!==-1,'Prévia deve apenas escalar as páginas físicas para caber na janela.');

  const portraitTheme={pageBg:'#fff',surfaceBg:'#fff',textColor:'#111',mutedColor:'#555',accentColor:'#287a3f',eventColors:['#287a3f','#176b87','#a96711','#7a4b92','#a63b3b','#5b6570'],monthsPerPage:1,pageOrientation:'PORTRAIT',monthEventsLayout:'SIDE_BY_SIDE',showWeeklyTotals:false,weeklyTotalsPosition:'LAST',monthlyTotalPosition:'AFTER_TABLE'};
  const css=previewCss_(portraitTheme,previewPrintProfile_(portraitTheme,[]));
  assertTrue_(css.indexOf('.screen-output .print-page')!==-1 && css.indexOf('width:204mm')!==-1 && css.indexOf('height:291mm')!==-1,'Prévia em tela deve usar a geometria física da orientação do Tema.');
  assertTrue_(css.indexOf('.render-preview-document{zoom:1!important')!==-1,'Impressão deve remover a escala visual aplicada apenas na tela.');

  const period={id:'P',eventTypeId:'T',title:'1º Semestre 2026',startDate:'2026-02-02',endDate:'2026-07-10'};
  const schoolType={visualRole:'DESTAQUE',schoolPeriod:true};
  const feb=buildPreviewMonth_(2026,2,[period],{dates:[],byMonth:{}},{holidays:[],occurrences:[]},[],portraitTheme,{T:schoolType});
  const jul=buildPreviewMonth_(2026,7,[period],{dates:[],byMonth:{}},{holidays:[],occurrences:[]},[],portraitTheme,{T:schoolType});
  assertTrue_(feb.indexOf('Início do 1º Semestre 2026')!==-1,'Data inicial de qualquer Tipo delimitador deve receber prefixo Início do.');
  assertTrue_(jul.indexOf('Fim do 1º Semestre 2026')!==-1,'Data final de qualquer Tipo delimitador deve receber prefixo Fim do.');
  assertFalse_(feb.indexOf('<time>02–10/07</time>')!==-1,'Período letivo não deve voltar a ser representado como uma única faixa/lista de intervalo na Prévia/PDF.');
}


function testR9RectificationAtomicityAndReconciliationContract_() {
  const createCode=String(createRectificationVersion),rollback=String(cleanupFailedRectificationVerified_),reconcile=String(reconcileIncompleteRectificationsUnderLock_);
  assertTrue_(createCode.indexOf("state:'COMMITTED'")!==-1&&createCode.indexOf('mechanicalCopy:true')!==-1,'Retificação deve registrar somente a conclusão mecânica da cópia.');
  assertTrue_(createCode.indexOf('cleanupFailedRectificationVerified_')!==-1,'Falha dentro da própria criação deve usar rollback verificado.');
  assertTrue_(rollback.indexOf('verifyRectificationCleanup_')!==-1,'Rollback da tentativa corrente deve confirmar ausência de resíduos.');
  assertTrue_(reconcile.indexOf('mutated:0')!==-1,'Reconciliação legada deve ser somente diagnóstica e nunca mutar Rascunhos.');
  assertFalse_(String(getBootstrapData).indexOf('reconcileIncompleteRectifications_')!==-1,'BOOT não pode reconciliar/regravar/excluir versões em elaboração.');
  assertTrue_(Number((String(SCHEMA_VERSION).match(/pv(\d+)$/)||[])[1]||0)>=14,'Estrutura de versionamento exige schema PV14 ou posterior.');
}

function testR9ProjectsDrawerCanonicalRefreshContract_() {
  const html=HtmlService.createHtmlOutputFromFile('index').getContent();
  const openStart=html.indexOf('function openProjectsModal(initialPanel)'),openStop=html.indexOf('function closeProjectsModal()',openStart),flow=html.slice(openStart,openStop);
  assertTrue_(flow.indexOf('.getProjectsWorkspaceData()')!==-1,'Abrir a Gaveta deve reler Projetos e versões da base canônica.');
  assertTrue_(html.indexOf("?'Em exibição':'Abrir'")!==-1,'Versão carregada deve ser rotulada Em exibição, não Aberta.');
  assertFalse_(String(getProjectsWorkspaceData).indexOf('reconcileIncompleteRectifications_')!==-1,'Leitura da Gaveta não pode executar reconciliação destrutiva ou corretiva de versões.');
}

function testR9PreviewOnlyOperationShieldContract_() {
  const html=HtmlService.createHtmlOutputFromFile('index').getContent();
  const start=html.indexOf('function setApplicationInteractionBlocked(active)');
  const stop=html.indexOf('function currentContextFeedbackTarget_()',start);
  const flow=html.slice(start,stop);
  assertTrue_(flow.indexOf("meta.kind==='PREVIEW'||meta.kind==='PREVIEW_PDF'")!==-1,'Faixa Operação em andamento deve ser exclusiva da Prévia/PDF iniciado dentro dela.');
  assertTrue_(flow.indexOf('if (previewOnly)')!==-1,'Operações fora da Prévia devem manter o operationShield oculto.');
  assertFalse_(flow.indexOf('if (blocked) {\n          el.operationShield.hidden = false')!==-1,'Bloqueio genérico não pode exibir a faixa exclusiva da Prévia.');
}

function testR9FinalizationReportProfessionalUiContract_() {
  const html=HtmlService.createHtmlOutputFromFile('index').getContent();
  ['finalization-hero','finalization-verdict','report-decision','report-group-title','report-section-badge'].forEach(function(token){assertTrue_(html.indexOf(token)!==-1,'Relatório profissional deve incluir '+token+'.');});
  const start=html.indexOf('function renderFinalizationReport(report)');
  const stop=html.indexOf('function openRectificationModal()',start);
  const flow=html.slice(start,stop);
  assertTrue_(flow.indexOf("label:'Checklist concluída'")!==-1 && flow.indexOf('auditSummary.ignored')!==-1,'Resumo executivo deve contar itens ignorados como concluídos.');
  assertTrue_(flow.indexOf("'Dias letivos por período letivo'")!==-1,'Relatório deve usar os períodos letivos reais em vez de apresentar semestre civil como referência principal.');
  assertTrue_(flow.indexOf("emptyOk:true,emptyText:'Nenhuma pendência bloqueante.'")!==-1,'Seções vazias devem exibir um resumo útil, nunca parecer caixas provisórias.');
  assertTrue_(html.indexOf('id="finalizationPublishBtn" type="button" hidden>Publicar versão</button>')!==-1,'Ação final deve comunicar explicitamente Publicar versão.');
  assertTrue_(String(buildFinalizationReport_).indexOf('periods: (school.periods||[])')!==-1,'Backend do relatório deve fornecer períodos reais e suas metas para a apresentação.');
}

function testPv23DensePrintFidelityContract_() {
  const theme={pageBg:'#ffffff',surfaceBg:'#ffffff',textColor:'#111111',mutedColor:'#555555',accentColor:'#287a3f',eventColors:['#ff1493','#176b87','#a96711','#7a4b92','#a63b3b','#5b6570'],monthsPerPage:12,pageOrientation:'LANDSCAPE',monthEventsLayout:'SIDE_BY_SIDE',showWeeklyTotals:true,weeklyTotalsPosition:'LAST',monthlyTotalPosition:'AFTER_TABLE'};
  const events=[];
  for(let i=1;i<=26;i++) events.push({eventTypeId:'E',title:'Evento acadêmico extenso número '+i+' para validar densidade de impressão',startDate:'2026-01-'+pad2_((i%28)+1),endDate:''});
  const html=buildPreviewMonth_(2026,1,events,{dates:[],byMonth:{}},{holidays:[],occurrences:[]},[],theme,{E:{visualRole:'PRINCIPAL'}});
  assertEquals_(26,(html.match(/<li>/g)||[]).length,'Nenhum item da lista pode ser removido para fazer o PDF caber.');
  assertTrue_(html.indexOf('Eventos do mês')!==-1,'Lista de eventos deve permanecer no documento denso.');
  assertTrue_(html.indexOf('--event-font:')!==-1,'Documento denso pode reduzir tipografia para respeitar a composição escolhida.');
  const css=previewCss_(theme,previewPrintProfile_(theme,[html]));
  assertTrue_(css.indexOf('margin:3mm')!==-1,'Margens mínimas devem ser mantidas também no cenário denso.');
  assertTrue_(css.indexOf('297mm 210mm')!==-1,'12 meses densos não podem voltar para retrato.');
}


function testPv19PreviewContextFeedbackContract_() {
  const code=HtmlService.createHtmlOutputFromFile('index').getContent();
  const start=code.indexOf('function openLivePreview()');
  const stop=code.indexOf('function createOperationProgressToken()',start);
  const flow=code.slice(start,stop);
  assertTrue_(flow.indexOf("beginCancelableOperation('',createOperationProgressToken()")!==-1,'Prévia/PDF devem proteger a mesa sem abrir feedback global.');
  assertTrue_(flow.indexOf('previewContextFeedback')!==-1,'Prévia deve possuir barra de feedback no próprio contexto.');
  assertFalse_(flow.indexOf("setSaving(true,'Preparando a prévia")!==-1,'Prévia não deve acionar painel global de processamento.');
  assertFalse_(flow.indexOf("setSaving(true,'Gerando PDF")!==-1,'PDF não deve acionar painel global sobre a mesa.');
}


function testPv20ProjectHardDeleteContract_() {
  const backend=String(hardDeleteCalendarProject);
  assertTrue_(backend.indexOf('canHardDeleteProject')!==-1,'Hard delete deve validar Administrador/Superusuário no backend.');
  assertTrue_(backend.indexOf('LockService.getScriptLock')!==-1,'Hard delete deve operar sob ScriptLock.');
  ['EVENTS','AUDIT_RULE_OVERRIDES','SCHOOL_DAY_SETTINGS','HOLIDAY_OCCURRENCES','SCHOOL_DAY_EXCEPTIONS','VERSION_SNAPSHOT_CHUNKS','CALENDARS','PROJECTS'].forEach(function(name){assertTrue_(backend.indexOf("getRequiredSheet_('"+name+"')")!==-1,'Hard delete deve limpar '+name+'.');});
  assertTrue_(backend.indexOf('confirmationName')!==-1,'Hard delete deve exigir confirmação explícita pelo nome do Projeto.');
  const html=HtmlService.createHtmlOutputFromFile('index').getContent();
  assertTrue_(html.indexOf('id="hardDeleteProjectBtn"')!==-1 && html.indexOf('id="projectDeletePanel"')!==-1,'Gaveta deve oferecer hard delete apenas no contexto do Projeto.');
  assertTrue_(html.indexOf('state.projectAccess.canHardDeleteProject')!==-1,'UI deve esconder a ação para perfis sem permissão.');
}


function testPv21HardeningAndRollbackContract_() {
  const hardDelete=String(hardDeleteCalendarProject);
  assertTrue_(hardDelete.indexOf('restoreHardDeleteBackup_')!==-1,'Falha parcial do hard delete deve acionar restauração automática.');
  assertTrue_(hardDelete.indexOf("DELETE_ROLLED_BACK")!==-1,'Rollback concluído deve produzir estado explícito para o usuário.');
  const html=HtmlService.createHtmlOutputFromFile('index').getContent();
  assertTrue_(html.indexOf('function applyNoCalendarWorkspaceState')!==-1,'Excluir o último Projeto deve limpar a mesa sem exigir F5.');
  assertTrue_(html.indexOf("el.newEventBtn.hidden=true")!==-1,'Mesa sem Projeto não deve manter ação de novo evento.');
  assertTrue_(html.indexOf("previewContextFeedback")!==-1,'Prévia/PDF devem manter comunicação no próprio contexto.');
}

function testPv22ThemeCatalogDecouplingContract_() {
  const saveCode=String(saveTheme);
  const deleteCode=String(deleteTheme);
  const adminCode=String(getThemeAdminData);
  const applyCode=String(setCalendarTheme);
  [saveCode,deleteCode,adminCode].forEach(function(code){
    assertTrue_(code.indexOf('calendarVersionMutationFailure_')===-1,'CRUD global de Temas não deve validar mutabilidade de versão.');
    assertTrue_(code.indexOf('DEFAULT_CALENDAR_ID')===-1,'CRUD global de Temas não deve depender do calendário legado CAL-DEFAULT.');
  });
  assertTrue_(applyCode.indexOf('calendarVersionMutationFailure_')!==-1,'Usar Tema nesta versão deve continuar validando RASCUNHO.');
  assertTrue_(applyCode.indexOf('LockService.getScriptLock')!==-1,'A ponte Versão → Tema deve operar sob ScriptLock.');
  assertTrue_(applyCode.indexOf('theme_id')!==-1,'A ponte explícita deve alterar apenas a referência theme_id da versão.');
  const html=HtmlService.createHtmlOutputFromFile('index').getContent();
  assertTrue_(html.indexOf('.saveTheme(payload)')!==-1,'Salvar Tema deve chamar o catálogo sem calendarId.');
  assertTrue_(html.indexOf('.deleteTheme(theme.id,Number(theme.version||0),true)')!==-1,'Excluir Tema deve chamar o catálogo sem calendarId.');
  assertTrue_(html.indexOf('.setCalendarTheme(state.calendarRecord.id,el.themeId.value)')!==-1,'Aplicar Tema deve permanecer ação explícita da versão aberta.');
}

function testPv22ThemeCatalogRoundTripWithoutCalendar_() {
  setup('TEST');
  const token=Utilities.getUuid().replace(/-/g,'').slice(0,10).toUpperCase();
  const seed=listThemes_(false).find(function(t){return t.id==='THEME-IFTM-LIGHT';})||listThemes_(false)[0];
  assertTrue_(!!seed,'É necessário um tema-base para o teste PV22.');
  const payload=Object.assign({},seed,{id:'',version:0,name:'PV22 TEMA SEM CALENDARIO '+token,active:true});
  const saved=saveTheme(payload);
  assertTrue_(saved.ok&&!!saved.theme&&!!saved.theme.id,'Tema deve ser salvo sem qualquer calendarId.');
  try {
    const admin=getThemeAdminData('CALENDAR-ID-OBSOLETO-'+token);
    assertTrue_(Array.isArray(admin.themes)&&admin.themes.some(function(t){return t.id===saved.theme.id;}),'Catálogo deve carregar mesmo com contexto de calendário inexistente.');
    assertFalse_(admin.calendarContextAvailable,'Contexto obsoleto deve ser ignorado, não derrubar o CRUD de Temas.');
    const deleted=deleteTheme(saved.theme.id,saved.theme.version,true);
    assertTrue_(deleted.ok,'Tema sem dependências deve ser excluído sem calendarId.');
  } finally {
    forceDeleteTheme_(saved.theme.id);
  }
}

function testPv22ThemeFreezeAndApplyBridgeContract_() {
  const finalizationCode=String(buildFinalizationSnapshot_);
  const materializedCode=String(getVersionMaterializedData_);
  const publicationCode=String(buildPublicationSnapshot_);
  assertTrue_(finalizationCode.indexOf('theme:getThemeForCalendar_')!==-1,'Finalização deve congelar as características do Tema consumido pelo rascunho.');
  assertTrue_(materializedCode.indexOf("readVersionSnapshot_(calendar.id,'FINALIZATION')")!==-1,'FINALIZADO deve materializar o Tema do snapshot, não do catálogo vivo.');
  assertTrue_(materializedCode.indexOf('getPublicationSnapshot_')!==-1,'PUBLICADO/ARQUIVADO devem materializar o snapshot institucional.');
  assertTrue_(publicationCode.indexOf("readVersionSnapshot_(calendar.id,'FINALIZATION')")!==-1,'Publicação deve herdar exatamente o Tema congelado na finalização.');
  assertTrue_(String(saveTheme).indexOf('setCalendarTheme_')===-1,'Salvar Tema não pode aplicá-lo implicitamente a qualquer versão.');
  assertTrue_(String(setCalendarTheme).indexOf('theme_id')!==-1,'Somente a ação explícita Usar neste calendário altera a referência do rascunho.');
}


function testPv24PrintOverflowSplitContract_() {
  const theme={pageBg:'#ffffff',surfaceBg:'#ffffff',textColor:'#111111',mutedColor:'#555555',accentColor:'#287a3f',eventColors:['#287a3f','#176b87','#a96711','#7a4b92','#a63b3b','#5b6570'],monthsPerPage:6,monthEventsLayout:'SIDE_BY_SIDE',showWeeklyTotals:true,weeklyTotalsPosition:'LAST',monthlyTotalPosition:'AFTER_TABLE'};
  const light=[];
  const dense=[];
  for(let m=1;m<=6;m++){
    light.push('<article class="month" data-event-count="2"><div class="event-list" data-event-count="2" data-event-lines="3"></div></div></article>');
    dense.push('<article class="month" data-event-count="24"><div class="event-list" data-event-count="24" data-event-lines="48"></div></div></article>');
  }
  const profile=previewPrintProfile_(theme,dense);
  const lightFit=printFitAssessment_(theme,light,profile);
  const denseFit=printFitAssessment_(theme,dense,profile);
  assertTrue_(lightFit.fits,'Lista pequena deve permanecer junto da grade na impressão.');
  assertFalse_(denseFit.fits,'Lista comprovadamente maior que a caixa física deve acionar split.');
  assertTrue_(denseFit.overflowMm>0,'Decisão de split deve registrar overflow físico mensurável.');
  const cal=printCalendarOnlyMonthHtml_('<article class="month" data-event-count="1"><div class="month-title"><h2>Janeiro 2026</h2></div><div class="month-layout side"><div class="calendar-box"><table></table></div><div class="event-list" data-event-count="1" data-event-lines="2"><h3>Eventos do mês</h3><ul><li>Evento</li></ul></div></div></article>');
  const ev=printEventsOnlyMonthHtml_('<article class="month" data-event-count="1"><div class="month-title"><h2>Janeiro 2026</h2></div><div class="month-layout side"><div class="calendar-box"><table></table></div><div class="event-list" data-event-count="1" data-event-lines="2"><h3>Eventos do mês</h3><ul><li>Evento</li></ul></div></div></article>');
  assertTrue_(cal.indexOf('calendar-box')!==-1 && cal.indexOf('Eventos do mês')===-1,'Página da grade não deve carregar a lista quando houver split.');
  assertTrue_(ev.indexOf('Eventos do mês')!==-1 && ev.indexOf('<table>')===-1,'Página de eventos deve conter a lista sem repetir a grade.');
}

function testPv24PrintOnlySplitAndTooltipContract_() {
  const backend=String(buildLivePreviewHtml_)+String(buildPrintPages_)+String(generateLivePreviewPdf)+String(getLivePreviewHtml);
  assertTrue_(backend.indexOf("'SCREEN'")!==-1,'Prévia em tela deve continuar usando modo SCREEN.');
  assertTrue_(backend.indexOf("'PDF'")!==-1,'Gerador PDF deve materializar explicitamente o documento de impressão.');
  assertTrue_(String(buildPrintPages_).indexOf("'calendar-only'")!==-1 && String(buildPrintPages_).indexOf("'events-only'")!==-1,'Overflow deve gerar páginas consecutivas grade → eventos.');
  const css=previewCss_({pageBg:'#fff',surfaceBg:'#fff',textColor:'#111',mutedColor:'#555',accentColor:'#287a3f',monthsPerPage:6,monthEventsLayout:'SIDE_BY_SIDE'},previewPrintProfile_({monthsPerPage:6,monthEventsLayout:'SIDE_BY_SIDE'},[]));
  assertTrue_(String(buildLivePreviewHtml_).indexOf('data-render-source="print-pages"')!==-1,'Prévia visual deve usar as mesmas páginas físicas geradas para impressão/PDF.');
  assertFalse_(String(buildLivePreviewHtml_).indexOf('screenPages')!==-1,'Não deve existir composição paralela screenPages capaz de divergir do Tema/PDF.');
  assertTrue_(css.indexOf('#previewContextFeedback{display:none!important}')!==-1,'Barra contextual da Prévia não deve ser impressa.');
  const html=HtmlService.createHtmlOutputFromFile('index').getContent();
  assertTrue_(html.indexOf('class="field-tooltip"')!==-1,'Configuração de meses por página deve possuir tooltip explicativo.');
  assertTrue_(html.indexOf('agrupará primeiro os eventos da mesma data')!==-1 && html.indexOf('criar páginas adicionais')!==-1,'Tooltip deve explicar a ordem adaptativa do PDF sem alterar monthsPerPage silenciosamente.');
}


function testPdfRegra086SameDateCompactionContract_() {
  const month='<article class="month" data-event-count="3"><div class="month-title"><h2>Janeiro 2026</h2></div><div class="month-layout side"><div class="calendar-box"><table></table></div><div class="event-list" data-event-count="3" data-event-lines="3"><h3>Eventos do mês</h3><ul>'+
    '<li><i class="event-mark" style="background-color:#111"></i><time>02</time><span>Dia do Engenheiro Agrônomo</span></li>'+
    '<li><i class="event-mark" style="background-color:#222"></i><time>02</time><span>Início das matrículas</span></li>'+
    '<li><i class="event-mark" style="background-color:#333"></i><time>03</time><span>Reunião pedagógica</span></li>'+
    '</ul></div></div></article>';
  const compact=printCompactSameDateMonthHtml_(month,4);
  assertTrue_((compact.match(/<time>02<\/time>/g)||[]).length===1,'REGRA-086 deve consolidar itens da mesma data em uma única linha.');
  assertTrue_(compact.indexOf('Dia do Engenheiro Agrônomo; Início das matrículas')!==-1,'Compactação deve preservar os dois títulos e separá-los por ponto e vírgula.');
  assertTrue_(compact.indexOf('Reunião pedagógica')!==-1,'Compactação não pode eliminar eventos de outras datas.');
  assertTrue_(compact.indexOf('data-print-group-size="2"')!==-1,'Linha compactada deve registrar quantos eventos foram agrupados.');
}

function testPdfRegra086AdaptationOrderContract_() {
  const code=String(buildPrintPages_);
  const original=code.indexOf('originalFit=printFitAssessment_');
  const compact=code.indexOf('printCompactSameDateMonthHtml_');
  const separate=code.indexOf("'calendar-only'");
  const columns2=code.indexOf('printProfile,2');
  const columns3=code.indexOf('printProfile,3');
  const extra=code.indexOf('additionalPages=true');
  assertTrue_(original!==-1&&compact>original&&separate>compact&&columns2>separate&&columns3>columns2&&extra>columns3,'REGRA-086 deve manter a ordem original → agrupar por data → separar → colunas → páginas adicionais.');
  const css=previewCss_({pageBg:'#fff',surfaceBg:'#fff',textColor:'#111',mutedColor:'#555',accentColor:'#287a3f',monthsPerPage:6,monthEventsLayout:'SIDE_BY_SIDE'},previewPrintProfile_({monthsPerPage:6,monthEventsLayout:'SIDE_BY_SIDE'},[]));
  assertFalse_(css.indexOf('.print-events-only .event-list{transform:scale')!==-1,'PDF não pode usar scale como atalho para evitar as adaptações previstas na REGRA-086.');
}

function testPdfRegra086NoContentDropAndCommunicationContract_() {
  const rows=[];
  for(let i=1;i<=240;i++){
    rows.push('<li><i class="event-mark" style="background-color:#287a3f"></i><time>'+pad2_(((i-1)%28)+1)+'</time><span>Evento obrigatório '+i+' com descrição de validação de paginação integral</span></li>');
  }
  const month='<article class="month print-events-month" data-event-count="240"><div class="month-title"><h2>Janeiro 2026</h2></div><div class="month-layout print-events-layout"><div class="event-list" data-event-count="240" data-event-lines="240"><h3>Eventos do mês</h3><ul>'+rows.join('')+'</ul></div></div></article>';
  const profile={orientation:'landscape',contentWidthMm:291,contentHeightMm:204};
  const flow=buildPrintEventFlowPages_({title:'Teste',versionNumber:1},{headerText:'',footerText:''},false,'',[month],profile,3);
  const joined=flow.pages.join('');
  assertTrue_(flow.pageCount>1,'Lista extrema deve gerar páginas adicionais em vez de ser cortada.');
  for(let i=1;i<=240;i++) assertTrue_(joined.indexOf('Evento obrigatório '+i+' ')!==-1,'Paginação não pode omitir o evento '+i+'.');
  assertTrue_(String(generateLivePreviewPdf).indexOf('adaptation:document.adaptation')!==-1,'Resposta do PDF deve devolver ao frontend os metadados da adaptação aplicada.');
  const html=HtmlService.createHtmlOutputFromFile('index').getContent();
  assertTrue_(html.indexOf('pdfAdaptationNotice')!==-1&&html.indexOf('result.adaptation')!==-1,'Interface deve comunicar ao usuário quando a composição do PDF foi adaptada.');
  assertTrue_(String(printAdaptationMessage_).indexOf('preserva a legibilidade e garante a exibição integral do conteúdo')!==-1,'Mensagem deve explicar a finalidade da adaptação prevista na REGRA-086.');
}


/** REGRA-086 — a medição precisa usar largura física, não data-event-lines/char fixo. */
function testPdfRegra086PhysicalWidthMeasurementContract_() {
  const theme={monthsPerPage:6,monthEventsLayout:'SIDE_BY_SIDE',headerText:'Calendário Acadêmico',footerText:''};
  const profile={orientation:'landscape',contentWidthMm:291,contentHeightMm:204};
  function month_(title){
    return '<article class="month" data-event-count="8"><div class="month-title"><h2>Janeiro 2026</h2></div><div class="month-layout side"><div class="calendar-box"><table></table></div><div class="event-list" data-event-count="8" data-event-lines="1"><h3>Eventos do mês</h3><ul>'+Array.from({length:8},function(){return '<li><i class="event-mark"></i><time>02</time><span>'+title+'</span></li>';}).join('')+'</ul></div></div></article>';
  }
  const chrome=printPageChromeMetrics_({title:'Teste'},theme,false,profile,'');
  const shortFit=printFitAssessment_(theme,[month_('Evento curto')],profile,chrome);
  const longFit=printFitAssessment_(theme,[month_('Evento com descrição deliberadamente extensa para produzir diversas quebras reais na coluna lateral estreita do calendário acadêmico')],profile,chrome);
  assertTrue_(longFit.maxListHeightMm>shortFit.maxListHeightMm*2,'Mesmo data-event-lines não pode mascarar a altura física de títulos longos.');
  assertTrue_(longFit.eventTitleWidthMm<25,'Medição de 6 meses deve refletir a largura física estreita da coluna lateral.');
  assertTrue_(String(printFitAssessment_).indexOf('guardedRequiredMm')!==-1,'Caso limítrofe deve incluir margem técnica antes de ser considerado ajustado.');
}

/** REGRA-086 — rodapé variável entra no orçamento físico da página. */
function testPdfRegra086VariableFooterReserveContract_() {
  const theme={monthsPerPage:4,monthEventsLayout:'SIDE_BY_SIDE',headerText:'Calendário Acadêmico',footerText:'Rodapé institucional'};
  const profile={orientation:'landscape',contentWidthMm:291,contentHeightMm:204};
  const shortChrome=printPageChromeMetrics_({title:'Calendário 2026'},theme,false,profile,'');
  const manyPeriods=Array.from({length:32},function(_,i){return 'Período acadêmico '+(i+1)+' com denominação extensa: '+(40+i);}).join(' · ');
  const footnote='<div class="school-day-footnote"><strong>Dias letivos:</strong> '+manyPeriods+'<br><strong>Por período:</strong> '+manyPeriods+'<br><strong>Total:</strong> 200 · <strong>75% previstos em:</strong> 01/10/2026</div>';
  const longChrome=printPageChromeMetrics_({title:'Calendário 2026'},theme,false,profile,footnote);
  assertTrue_(longChrome.reservedChromeMm>shortChrome.reservedChromeMm,'Rodapé que quebra em mais linhas deve reservar mais altura física.');
  assertTrue_(longChrome.bodyHeightMm<shortChrome.bodyHeightMm,'A caixa útil precisa diminuir quando o rodapé cresce.');
  assertTrue_(longChrome.safetyMm>=5,'Medição deve preservar margem de segurança contra arredondamentos do conversor PDF.');
}

/** REGRA-086 — paginação em colunas contabiliza altura real de cada linha. */
function testPdfRegra086FlowPhysicalHeightContract_() {
  const profile={orientation:'landscape',contentWidthMm:291,contentHeightMm:204};
  const chrome={bodyHeightMm:150};
  const flow=printEventFlowProfile_(profile,3,chrome);
  const row={dateHtml:'02',titleHtml:'Evento simples',markerHtml:''};
  const rowHeight=printEventRowHeightMm_(row,flow);
  assertTrue_(rowHeight>flow.lineHeightMm,'Altura de uma entrada deve incluir padding e borda, não apenas a linha tipográfica.');
  assertTrue_(String(buildPrintEventFlowPages_).indexOf('used[columnIndex]+heightMm>flow.capacityMm')!==-1,'Quebra de coluna deve comparar milímetros ocupados com a capacidade física.');
  assertFalse_(String(buildPrintEventFlowPages_).indexOf('used[columnIndex]+weight>flow.linesPerColumn')!==-1,'Paginação não deve voltar à antiga contagem abstrata de linhas.');
}

/** REGRA-086 — até um único título anormalmente longo deve continuar integral. */
function testPdfRegra086ExtremeSingleTitlePaginationContract_() {
  const tokens=Array.from({length:520},function(_,i){return 'token'+pad2_((i%99)+1)+'x'+i;});
  const title=tokens.join(' ');
  const month='<article class="month print-events-month" data-event-count="1"><div class="month-title"><h2>Janeiro 2026</h2></div><div class="month-layout print-events-layout"><div class="event-list" data-event-count="1"><h3>Eventos do mês</h3><ul><li><i class="event-mark"></i><time>02</time><span>'+title+'</span></li></ul></div></div></article>';
  const profile={orientation:'landscape',contentWidthMm:291,contentHeightMm:204};
  const flow=buildPrintEventFlowPages_({title:'Teste',versionNumber:1},{headerText:'',footerText:''},false,'',[month],profile,3,'');
  const joined=flow.pages.join('');
  assertTrue_(flow.pageCount>1,'Um título individual maior que uma página deve ser fragmentado em páginas adicionais, nunca cortado.');
  tokens.forEach(function(token){assertTrue_(joined.indexOf(token)!==-1,'Título longo não pode perder o conteúdo '+token+'.');});
  assertTrue_(String(printEventRowFragments_).indexOf('maxLines')!==-1,'Fluxo deve possuir fragmentação explícita para uma única entrada maior que a coluna física.');
}


/**
 * BUG-074 — o total da visão mensal deve usar currentStart/currentEnd, não
 * activeStart/activeEnd, pois estes incluem células de preenchimento de meses vizinhos.
 */
function testPv26MonthSchoolDayVisibleRangeContract_() {
  const html = HtmlService.createHtmlOutputFromFile('index').getContent();
  const helperStart = html.indexOf('function schoolDayRangeForCurrentView(view)');
  const totalStart = html.indexOf('function updateSchoolDayViewTotal()', helperStart);
  const totalEnd = html.indexOf('function createCalendarWhenSurfaceIsReady', totalStart);
  const helper = html.slice(helperStart, totalStart);
  const total = html.slice(totalStart, totalEnd);
  assertTrue_(helperStart !== -1, 'PV26 deve centralizar o intervalo lógico usado pela contagem da visão.');
  assertTrue_(helper.indexOf('view.currentStart') !== -1 && helper.indexOf('view.currentEnd') !== -1,
    'Contagem da visão deve priorizar currentStart/currentEnd do FullCalendar.');
  assertTrue_(helper.indexOf("view.type === 'dayGridMonth'") !== -1 && helper.indexOf('state.calendar.getDate()') !== -1,
    'Mês deve possuir fallback por limites civis exatos sem depender das células de preenchimento.');
  assertFalse_(total.indexOf('view.activeStart') !== -1 || total.indexOf('view.activeEnd') !== -1,
    'updateSchoolDayViewTotal não deve mais somar diretamente o intervalo desenhado activeStart/activeEnd.');
  assertTrue_(total.indexOf('schoolDayRangeForCurrentView(state.calendar.view)') !== -1,
    'Total da visão deve consumir o intervalo lógico centralizado.');

  // Regressão do caso real: março/2026 = 22 dias de segunda a sexta + sábado 07/03.
  // As células 01–04/abril podem estar visíveis no grid, mas não pertencem ao total de março.
  const march = [];
  const start = new Date(Date.UTC(2026, 2, 1));
  const end = new Date(Date.UTC(2026, 3, 1));
  for (let cursor = new Date(start.getTime()); cursor < end; cursor.setUTCDate(cursor.getUTCDate() + 1)) {
    const dow = cursor.getUTCDay();
    if (dow >= 1 && dow <= 5) march.push(isoUtcDate_(cursor));
  }
  march.push('2026-03-07');
  assertEquals_(23, Array.from(new Set(march)).length,
    'Caso real de março/2026 deve resultar em 23 dias letivos, sem carregar abril para o total mensal.');
}


/** PV27 — BUG-075: trocar Tipo/Regra não apaga o término vindo de drag. */
function testPv27EventSelectionPreservationContract_() {
  const html=HtmlService.createHtmlOutputFromFile('index').getContent();
  const start=html.indexOf('function applyEventTypeRules(fillTitle)');
  const end=html.indexOf('function isIsoDateClient',start);
  const code=html.slice(start,end);
  assertTrue_(code.indexOf('state.draftSelectionEndExplicit')!==-1,'Editor deve distinguir término explicitamente escolhido por arraste.');
  assertTrue_(code.indexOf('if (state.draftSelectionEndExplicit && selectionEnd) el.endDate.value = selectionEnd;')!==-1,'Término explícito da seleção deve ser preservado ao escolher a regra.');
  assertTrue_(html.indexOf("state.draftSelectionEndExplicit = !!(end && start && String(end) !== String(start));")!==-1,'openNewEvent deve registrar quando o usuário realmente escolheu um intervalo.');
}

/** PV27 — BUG-076 / UX-078: datas relacionadas e contador reativo. */
function testPv27ContextualDatesAndSchoolDayCounterContract_() {
  const html=HtmlService.createHtmlOutputFromFile('index').getContent();
  assertTrue_(html.indexOf('id="schoolPeriodDayCount"')!==-1,'Editor de período deve exibir contador informativo de dias letivos.');
  assertTrue_(html.indexOf('function syncRelatedDateConstraints()')!==-1,'Datas inicial/final devem compartilhar limites contextuais.');
  assertTrue_(html.indexOf("el.endDate.min = start")!==-1 && html.indexOf("el.startDate.max = end")!==-1,'Término não pode preceder início e início não deve navegar além do término já escolhido.');
  assertTrue_(html.indexOf('primeRelatedNativeDatePicker(el.endDate, el.startDate.value, event)')!==-1,'Picker de término deve abrir ancorado no contexto da data inicial.');
  assertTrue_(html.indexOf('updateSchoolPeriodDayCount();')!==-1 && html.indexOf('.previewSchoolDayCount(state.calendarRecord.id, start, end)')!==-1,'Mudanças de data devem recalcular o contador pela regra canônica do backend.');
  const preview=String(previewSchoolDayCount);
  assertTrue_(preview.indexOf('holidayDateMapForYears_')!==-1 && preview.indexOf("schoolDayEffect || 'NEUTRO'")!==-1 && preview.indexOf('listSchoolDayExceptions_')!==-1,'Contador deve considerar semana, feriados, efeitos dos eventos e exceções.');
}

/** PV27 — BUG-077: item parcial reabre o evento persistido. */
function testPv27PartialAuditResumeContract_() {
  const backend=String(auditEventType_);
  const html=HtmlService.createHtmlOutputFromFile('index').getContent();
  assertTrue_(backend.indexOf('resumeEventId')!==-1,'Auditoria deve indicar qual ocorrência incompleta pode ser retomada.');
  assertTrue_(backend.indexOf('startDate: storedDateToIso_(row.start_date)')!==-1 && backend.indexOf('endDate: storedDateToIso_(row.end_date)')!==-1,'Snapshot parcial deve preservar as datas já cadastradas.');
  assertTrue_(html.indexOf("item.status === 'PARCIAL' && item.resumeEventId && openExistingEventByLogicalId(item.resumeEventId)")!==-1,'Clique em item parcial deve reabrir a ocorrência existente, não criar outra vazia.');
}

/** PV27 — UX-079: Pendente → Parcial → Concluído e filtro multiseleção. */
function testPv27AuditOrderingAndFilterContract_() {
  const html=HtmlService.createHtmlOutputFromFile('index').getContent();
  assertTrue_(html.indexOf('id="auditStatusPending"')!==-1 && html.indexOf('id="auditStatusPartial"')!==-1 && html.indexOf('id="auditStatusCompleted"')!==-1,'Checklist deve expor os três grupos no filtro.');
  assertTrue_(html.indexOf('const statusRank = { PENDENTE:0, PARCIAL:1, ATENDIDA:2, IGNORADA:2 };')!==-1,'Ordem operacional deve priorizar pendente, parcial e concluído.');
  assertTrue_(html.indexOf("localeCompare(String(b.name || ''), 'pt-BR'")!==-1,'Itens dentro do grupo devem ser ordenados alfabeticamente.');
  assertTrue_(html.indexOf('state.auditStatusFilters.PENDENTE')!==-1 && html.indexOf('state.auditStatusFilters.PARCIAL')!==-1 && html.indexOf('state.auditStatusFilters.ATENDIDA')!==-1,'Filtro deve permitir qualquer combinação dos três grupos.');
}

/** PV27 — versões congeladas nunca usam regras posteriores. */
function testPv27FrozenAuditContract_() {
  const getter=String(getCalendarAudit);
  const frozen=String(getFrozenCalendarAudit_);
  assertTrue_(getter.indexOf("calendar.status !== CALENDAR_VERSION_STATUS.DRAFT")!==-1,'getCalendarAudit deve separar versões congeladas do rascunho.');
  assertTrue_(getter.indexOf('getFrozenCalendarAudit_')!==-1,'FINALIZADO/PUBLICADO/ARQUIVADO devem usar auditoria congelada.');
  assertFalse_(frozen.indexOf('buildCalendarAudit_')!==-1,'Leitura histórica não pode recalcular usando EVENT_TYPES atual.');
  assertTrue_(frozen.indexOf("readVersionSnapshot_(calendar.id, 'FINALIZATION')")!==-1 && frozen.indexOf('getPublicationSnapshot_')!==-1,'Auditoria histórica deve vir do snapshot apropriado ao estado.');
  const materialized=String(getVersionMaterializedData_);
  assertTrue_(materialized.indexOf('audits:snapshot.audits||[]')!==-1,'Bootstrap deve levar as auditorias congeladas para navegação histórica sem reanálise.');
  assertTrue_(materialized.indexOf('if(frozen) throw new Error')!==-1,'Versão congelada sem snapshot deve falhar explicitamente, nunca cair para EVENT_TYPES atual.');
  const report=String(getFinalizationReport);
  assertTrue_(report.indexOf('getPublicationSnapshot_')!==-1,'Relatório de versão PUBLICADA/ARQUIVADA também deve vir do snapshot histórico.');
  assertTrue_(report.indexOf('isCalendarVersionImmutableStatus_')!==-1,'Relatório histórico não pode recalcular uma versão imutável com regras atuais.');
}

/** PV27 — regra '=' é texto estrutural, nunca fórmula. */
function testPv27QuantityRuleTextContract_() {
  const migration=String(migrateEventTypeQuantityRuleText_)+String(formatEventTypeQuantityRuleColumnAsText_);
  assertTrue_(migration.indexOf("setNumberFormat('@')")!==-1,'Coluna regra_quantidade deve ser formatada integralmente como texto.');
  assertTrue_(migration.indexOf("formula === '='")!==-1,'Migração deve recuperar o operador igual que virou fórmula inválida.');
  let threw=false;
  try { compareQuantity_(1,'#ERROR!',1); } catch(error) { threw=true; }
  assertTrue_(threw,'Operador inválido não pode cair silenciosamente no fallback >=.');
}

/** PV27 — fonte nacional repetida não cria dois mestres equivalentes. */
function testPv27HolidaySeedDedupContract_() {
  const code=String(seedNationalHolidayCatalogFromApi_);
  assertTrue_(code.indexOf('seenKeys')!==-1,'Seed deve deduplicar também os itens recebidos na mesma resposta da fonte.');
  assertTrue_(code.indexOf('seenKeys[item.key] = true')!==-1,'Após a primeira inserção, a chave deve ser marcada imediatamente.');
  const sanitizer=String(sanitizeDuplicateHolidayCatalog_);
  assertTrue_(sanitizer.indexOf('repointedOccurrences')!==-1 && sanitizer.indexOf('conflicts')!==-1,'Atualização deve consolidar duplicatas existentes preservando ocorrências e detectar conflito de datas.');
}


/** Metas opcionais de dias letivos pertencem ao Tipo de Evento e geram tarefa por período. */
function testSchoolDayTargetsAndChecklistContract_() {
  const schema=DB_SCHEMA;
  assertTrue_(schema.EVENT_TYPES.indexOf('meta_dias_letivos')!==-1,'EVENT_TYPES deve persistir a meta diretamente no Tipo de Evento.');
  const model=String(buildSchoolDayModel_);
  assertTrue_(model.indexOf('type.schoolDayTargetDays')!==-1 && model.indexOf('targetReached')!==-1,'Malha letiva deve herdar a meta do Tipo e apurar atingimento dentro de cada período.');
  assertFalse_(model.indexOf('school_day_target_id')!==-1,'Malha letiva não deve depender do vínculo individual antigo no evento.');
  const audit=String(buildCalendarAudit_)+String(buildSchoolDayTargetAuditItems_);
  assertTrue_(audit.indexOf('buildSchoolDayTargetAuditItems_')!==-1 && audit.indexOf("kind:'SCHOOL_DAY_TARGET'")!==-1,'Meta do Tipo deve gerar tarefa própria na Checklist para cada período correspondente.');
  const validation=String(validateEventTypePayload_);
  assertTrue_(validation.indexOf('item.schoolDayTargetEnabled && !item.schoolPeriod')!==-1,'Meta só pode existir em Tipo que delimita período letivo.');
}

/** Itens ignorados são operacionalmente concluídos e não impedem 100% da Checklist. */
function testIgnoredAuditCountsAsCompletedContract_() {
  const summary=buildAuditSummary_([{status:'ATENDIDA'},{status:'IGNORADA'},{status:'PENDENTE'}]);
  assertEquals_(3,summary.total,'Total deve preservar itens ignorados para auditoria.');
  assertEquals_(2,summary.attended,'Ignorada deve contar no numerador de concluídas.');
  assertEquals_(1,summary.ignored,'Indicador separado de ignoradas deve ser preservado.');
  assertEquals_(1,summary.pending,'Pendência real deve continuar separada.');
}

/** quantity_rule da Checklist é texto estrutural e operador inválido não recebe fallback silencioso. */
function testAuditQuantityRuleTextContract_() {
  const migration=String(migrateAuditRuleQuantityRuleText_)+String(formatAuditRuleQuantityRuleColumnAsText_);
  assertTrue_(migration.indexOf("setNumberFormat('@')")!==-1,'Coluna quantity_rule deve ser formatada estruturalmente como texto.');
  assertTrue_(migration.indexOf("value = '='")!==-1,'Migração deve reparar o operador igual convertido em erro de fórmula.');
  let threw=false;
  try { auditRuleRowToClient_({id:'X',event_type_id:'T',enabled:true,expected_quantity:1,quantity_rule:'#ERROR! (Formula parse error.)',period_unit:'ANO',ignored:false}); } catch(error) { threw=true; }
  assertTrue_(threw,'Regra armazenada inválida deve falhar explicitamente em vez de virar >=.');
}

/** Toda totalização continua restrita aos períodos acadêmicos cadastrados. */
function testSchoolDayPeriodScopedSummaryContract_() {
  const code=String(buildSchoolDayModel_);
  assertTrue_(code.indexOf('completePeriods.forEach')!==-1,'Dias-base devem nascer exclusivamente dos períodos letivos completos.');
  assertTrue_(code.indexOf('insidePeriod = completePeriods.some')!==-1,'Efeitos de eventos devem ser limitados aos períodos cadastrados.');
  assertTrue_(code.indexOf('seventyFivePercentDate')!==-1 && code.indexOf('Math.ceil(sortedDates.length*0.75)')!==-1,'Marco de 75% deve usar a sequência efetiva de dias letivos dos períodos.');
  assertTrue_(code.indexOf('schoolDaysByMonth')!==-1,'Cada período deve expor sua própria distribuição mensal de dias letivos.');
}

/** Meta é configurada no Tipo de Evento; painel do período é somente informativo. */
function testSchoolDayTargetUiContract_() {
  const html=HtmlService.createHtmlOutputFromFile('index').getContent();
  assertTrue_(html.indexOf('id="eventTypeSchoolDayTargetEnabled"')!==-1 && html.indexOf('id="eventTypeSchoolDayTargetDays"')!==-1,'Cadastro do Tipo deve oferecer checkbox e quantidade da meta.');
  assertTrue_(html.indexOf('id="eventTypeSchoolPeriod"') < html.indexOf('id="eventTypeSchoolDayTargetEnabled"'),'Meta deve aparecer logo após a definição de período letivo.');
  assertFalse_(html.indexOf('id="schoolDayTargetSelect"')!==-1,'Painel de Período Letivo não deve manter seletor individual de meta.');
  assertFalse_(html.indexOf('id="schoolDayTargetName"')!==-1 || html.indexOf('id="schoolDayTargetList"')!==-1,'Tela Dias letivos não deve manter o catálogo antigo de metas.');
  assertTrue_(html.indexOf('Meta deste Tipo de Evento:')!==-1 && html.indexOf('Meta atingida')!==-1 && html.indexOf('Faltam ')!==-1,'Painel deve destacar meta herdada do Tipo e seu cumprimento.');
  assertTrue_(html.indexOf('width:min(520px,calc(100% - 36px))')!==-1,'Painel lateral deve preservar a largura ampliada.');
}

/** Prévia/Impressão/PDF exibem o resumo letivo baseado na malha dos períodos. */
function testSchoolDayPreviewFootnoteContract_() {
  const code=String(schoolDayFootnoteHtml_);
  assertTrue_(code.indexOf('school.byMonth')!==-1,'Nota deve mostrar totais mensais oriundos da malha letiva.');
  assertTrue_(code.indexOf('school.periods')!==-1 && code.indexOf('schoolDayCount')!==-1,'Nota deve mostrar o total de cada período cadastrado.');
  assertTrue_(code.indexOf('school.total')!==-1 && code.indexOf('seventyFivePercentDate')!==-1,'Nota deve mostrar total agregado e data prevista de 75%.');
  assertTrue_(String(buildPrintPages_).indexOf('schoolDayFootnoteForMonths_(school,group,eventTypes)')!==-1,'Prévia e documento impresso devem compor o resumo dos meses da página.');
}

function compactSchoolDayFooterFixture_() {
  return {
    school:{configured:true,completePeriods:6,total:12,seventyFivePercentDate:'2027-07-01',
      dates:['2027-02-01','2027-02-02','2027-02-03','2027-02-04','2027-02-05','2027-02-06','2027-02-07','2027-02-08','2027-07-01','2027-08-02','2027-12-01','2027-12-02'],
      byMonth:{'2027-02':8,'2027-07':1,'2027-08':1,'2027-12':2},
      periods:[
        {eventTypeId:'S1',title:'1º Semestre Letivo',startDate:'2027-02-01',endDate:'2027-07-01',complete:true,schoolDayCount:9},
        {eventTypeId:'S2',title:'2º Semestre',startDate:'2027-08-02',endDate:'2027-12-02',complete:true,schoolDayCount:3},
        {eventTypeId:'YEAR',title:'Anual',startDate:'2027-02-01',endDate:'2027-12-02',complete:true,schoolDayCount:12},
        {eventTypeId:'OTHER',title:'Inscrições para o PROLIF 2027/1',startDate:'2027-02-01',endDate:'2027-02-03',complete:true,schoolDayCount:3},
        {eventTypeId:'OTHER',title:'Aula inaugural CENID',startDate:'2027-02-04',endDate:'2027-02-04',complete:true,schoolDayCount:1},
        {eventTypeId:'OTHER',title:'Aula inaugural CENID',startDate:'2027-02-05',endDate:'2027-02-05',complete:true,schoolDayCount:1}
      ]},
    types:[{id:'S1',code:'PERIODO_LETIVO_1_SEMESTRE'},{id:'S2',code:'PERIODO_LETIVO_2_SEMESTRE'},{id:'YEAR',code:'PERIODO_LETIVO_ANUAL'},{id:'OTHER',code:'DIVERSO'}]
  };
}

function compactSchoolDayFooterRows_(html) {
  return (html.match(/<tr data-school-summary-kind="[\s\S]*?<\/tr>/g)||[]).map(function(row){
    return {kind:row.match(/data-school-summary-kind="([^"]+)"/)[1],month:row.match(/data-school-summary-month="([^"]+)"/)[1],
      values:(row.match(/<td>[\s\S]*?<\/td>/g)||[]).map(function(cell){return Number(cell.replace(/<[^>]+>/g,''));})};
  });
}

function testCompactSchoolDayFooterCounts_() {
  const fixture=compactSchoolDayFooterFixture_(),school=fixture.school,before=JSON.stringify(fixture);
  function footer(month){return schoolDayFootnoteHtml_(school,[month],fixture.types);}
  const feb=footer('2027-02'),july=footer('2027-07'),december=footer('2027-12');
  assertEquals_('2,1,1,1,1,1,1,8',compactSchoolDayFooterRows_(feb)[0].values.join(','),'Mensal deve contar cada dia da semana, inclusive sábado e domingo.');
  assertEquals_('0,0,0,0,0,0,0,0',compactSchoolDayFooterRows_(footer('2027-03'))[0].values.join(','),'Mês sem aulas deve exibir todos os zeros.');
  const julyRows=compactSchoolDayFooterRows_(july),decemberRows=compactSchoolDayFooterRows_(december);
  assertEquals_('month,semester',julyRows.map(function(r){return r.kind;}).join(','),'Primeiro semestre deve fechar em julho, conforme a data cadastrada.');
  assertEquals_('2,1,1,2,1,1,1,9',julyRows[1].values.join(','),'Semestre deve somar as datas de todo o período.');
  assertEquals_('month,semester,year',decemberRows.map(function(r){return r.kind;}).join(','),'No encerramento devem constar mês, semestre e ano.');
  assertEquals_('1,0,1,1,0,0,0,3',decemberRows[1].values.join(','),'Segundo semestre deve ter sua própria distribuição.');
  assertEquals_('3,1,2,3,1,1,1,12',decemberRows[2].values.join(','),'Anual deve contar datas únicas, sem somar períodos sobrepostos.');
  assertTrue_(july.indexOf('Acumulados até jul/2027: <strong>9 de 12 dias</strong>')!==-1,'Acumulado deve começar no primeiro dia letivo do ano.');
  assertTrue_(december.indexOf('Acumulados até dez/2027: <strong>12 de 12 dias</strong>')!==-1,'Acumulado final deve alcançar o total anual.');
  assertTrue_(feb.indexOf('9º dia letivo:</strong> 01/07/2027')!==-1,'Marco de 75% deve preservar a data já calculada na malha.');
  assertTrue_(feb.indexOf('Inscrições para o PROLIF 2027/1: <strong>3</strong>')!==-1,'Períodos diversos devem permanecer visíveis.');
  assertEquals_(2,(feb.match(/Aula inaugural CENID: <strong>1<\/strong>/g)||[]).length,'Registros com título igual não podem ser agrupados nem removidos.');
  const allMonths=[];for(let month=1;month<=12;month++)allMonths.push('2027-'+('0'+month).slice(-2));
  const annualPage=schoolDayFootnoteHtml_(school,allMonths,fixture.types);
  assertEquals_(15,compactSchoolDayFooterRows_(annualPage).length,'Página anual deve manter 12 meses, dois semestres e um ano.');
  assertTrue_(annualPage.indexOf('--school-summary-columns:2')!==-1,'Muitos resumos devem dividir a largura disponível para reduzir a altura.');
  assertTrue_(annualPage.indexOf('jul/2027 · acum. 9')!==-1,'Cada mês de uma página com vários meses deve informar seu acumulado.');
  assertEquals_(before,JSON.stringify(fixture),'A apresentação não pode modificar a malha nem os períodos.');
  school.dates.unshift('2026-12-31','2027-02-01');
  assertTrue_(footer('2027-02').indexOf('Acumulados até fev/2027: <strong>8 de 12 dias</strong>')!==-1,'Acumulado deve excluir outros anos e não duplicar datas.');
  school.periods[3].title='<img src=x onerror=alert(1)>';
  assertFalse_(footer('2027-02').indexOf('<img src=x')!==-1,'Descrições de períodos devem ser escapadas.');
}

function testCompactSchoolDayFooterSurfaceParity_() {
  const html=HtmlService.createHtmlOutputFromFile('index').getContent();
  const start=html.indexOf('function schoolDayFootnoteHtml_('),end=html.indexOf('function fillSchoolDayMonthSummary(',start);
  assertTrue_(start>=0&&end>start,'Mesa deve disponibilizar o renderizador puro do rodapé.');
  const client=Function('return ('+html.slice(start,end).trim()+');')();
  const fixture=compactSchoolDayFooterFixture_();
  [['2027-02'],['2027-03'],['2027-07'],['2027-12'],['2027-02','2027-03','2027-07','2027-12']].forEach(function(months){
    assertEquals_(schoolDayFootnoteHtml_(fixture.school,months,fixture.types),client(fixture.school,months,fixture.types),'Mesa e Prévia/PDF devem renderizar as mesmas contagens.');
  });
  assertTrue_(html.indexOf('schoolDayFootnoteHtml_(model,[key],state.calendarEventTypes||[])')!==-1,'Visão mensal deve usar o resumo compacto.');
  assertTrue_(html.indexOf('schoolDayFootnoteHtml_(state.schoolDayModel,months,state.calendarEventTypes||[])')!==-1,'Visões de semestre e ano devem usar o mesmo resumo.');
}

function testCompactSchoolDayFooterPageScope_() {
  const fixture=compactSchoolDayFooterFixture_(),theme=Object.assign({},DEFAULT_THEMES[0],{logoUrl:'',monthsPerPage:2});
  const monthKeys=['2027-02','2027-03','2027-07','2027-12'];
  const months=monthKeys.map(function(key){return buildPreviewMonth_(Number(key.slice(0,4)),Number(key.slice(5,7)),[],fixture.school,{holidays:[],occurrences:[]},[],theme,{});});
  const result=buildPrintPages_({title:'Calendário 2027'},theme,false,'',months,2,2,1,previewPrintProfile_(theme,months),fixture.school,fixture.types);
  result.pages.forEach(function(page){
    const footer=page.slice(page.indexOf('<footer'));
    const firstGroup=page.indexOf('data-school-month="2027-02"')!==-1;
    const rows=compactSchoolDayFooterRows_(footer);
    const expected=firstGroup?'2027-02,2027-03':'2027-07,2027-12';
    assertEquals_(expected,rows.filter(function(row){return row.kind==='month';}).map(function(row){return row.month;}).join(','),'Cada rodapé deve conter somente os meses da própria página.');
    assertTrue_(footer.indexOf('Dias Letivos por período letivo:')!==-1,'Lista diagnóstica deve permanecer em todas as páginas.');
  });
  assertTrue_(result.pages.length>=2,'Teste deve exercer mais de uma página.');
}

function testMonthlyTablesOmitLegacySchoolDayFooter_() {
  const fixture=compactSchoolDayFooterFixture_(),before=JSON.stringify(fixture);
  ['FIRST','LAST'].forEach(function(position){
    const theme=Object.assign({},DEFAULT_THEMES[0],{showWeeklyTotals:true,weeklyTotalsPosition:position});
    const html=buildPreviewMonth_(2027,2,[],fixture.school,{holidays:[],occurrences:[]},[],theme,{});
    assertFalse_(html.indexOf('class="weekly"')!==-1,'A tabela mensal não deve repetir o rodapé semanal legado, mesmo na posição '+position+'.');
    assertFalse_(html.indexOf('weekday-totals')!==-1||html.indexOf('S1=')!==-1,'Contagens antigas devem sair da grade mensal.');
    assertEquals_(28,(html.match(/class="day-number"/g)||[]).length,'Todos os dias de fevereiro devem permanecer na tabela.');
    assertEquals_(8,(html.match(/<td class="school /g)||[]).length,'Marcadores dos dias letivos devem permanecer intactos.');
  });
  const footer=schoolDayFootnoteHtml_(fixture.school,['2027-02'],fixture.types);
  assertEquals_('2,1,1,1,1,1,1,8',compactSchoolDayFooterRows_(footer)[0].values.join(','),'O rodapé consolidado deve preservar as contagens por dia da semana.');
  assertEquals_(before,JSON.stringify(fixture),'A remoção visual não pode alterar os dados letivos.');
}


function testPv12DefaultEventTypeBaseline_() {
  assertEquals_(20, DEFAULT_EVENT_TYPES.length, 'A base mínima acadêmica deve ter 20 tipos após substituir o período genérico pelos três períodos canônicos.');
  const expected={
    MATRICULA_INICIAL:['Matrícula inicial',true,false,false,0,'NEUTRO','PRINCIPAL',2,'>='],
    REMATRICULA:['Rematrícula',true,true,false,0,'NEUTRO','PRINCIPAL',2,'>='],
    MATRICULA_EXTEMPORANEA:['Matrícula extemporânea',true,true,false,0,'NEUTRO','PRINCIPAL',2,'>='],
    AJUSTE_MATRICULA:['Ajuste de matrícula',true,false,false,0,'NEUTRO','SECUNDARIO',2,'>='],
    TRANCAMENTO_TOTAL:['Trancamento total',true,true,false,0,'NEUTRO','SECUNDARIO',2,'>='],
    TRANCAMENTO_PARCIAL:['Trancamento parcial',true,true,false,0,'NEUTRO','SECUNDARIO',2,'>='],
    PROCESSO_SELETIVO:['Processo seletivo',true,false,false,0,'NEUTRO','DESTAQUE',2,'>='],
    VAGAS_REMANESCENTES:['Vagas remanescentes',true,false,false,0,'NEUTRO','DESTAQUE',2,'>='],
    PERIODO_LETIVO_ANUAL:['Anual',true,true,true,200,'NEUTRO','DESTAQUE',1,'>='],
    PERIODO_LETIVO_1_SEMESTRE:['1º Semestre',true,true,true,100,'NEUTRO','DESTAQUE',1,'>='],
    PERIODO_LETIVO_2_SEMESTRE:['2º Semestre',true,true,true,100,'NEUTRO','DESTAQUE',1,'>='],
    APROVEITAMENTO_ESTUDOS:['Aproveitamento de estudos',false,true,false,0,'NEUTRO','INFORMATIVO',2,'>='],
    EXAME_PROFICIENCIA:['Exame de proficiência',false,true,false,0,'NEUTRO','INFORMATIVO',2,'>='],
    RECUPERACAO_FINAL:['Recuperação final',true,true,false,0,'NEUTRO','ATENCAO',1,'='],
    DEFESA_TCC:['Defesa de TCC',false,true,false,0,'NEUTRO','NEUTRO',2,'>='],
    DEFESA_ESTAGIO:['Defesa de estágio',false,true,false,0,'NEUTRO','NEUTRO',2,'>='],
    FERIAS_ACADEMICAS:['Férias acadêmicas',true,true,false,0,'NAO_LETIVO','ATENCAO',2,'>='],
    RECESSO:['Recesso',true,false,false,0,'NAO_LETIVO','ATENCAO',0,''],
    EVENTOS_DIVERSOS:['Eventos Diversos',true,false,false,0,'NEUTRO','PRINCIPAL',0,''],
    COLACAO_GRAU:['Colação de grau',false,true,false,0,'NEUTRO','NEUTRO',2,'>=']
  };
  const byCode={}; DEFAULT_EVENT_TYPES.forEach(function(d){byCode[d[0]]=d;});
  assertEquals_(Object.keys(expected).length,Object.keys(byCode).length,'A base padrão não deve carregar tipos acadêmicos extras.');
  Object.keys(expected).forEach(function(code){
    const d=byCode[code],x=expected[code];assertTrue_(!!d,'Tipo padrão ausente: '+code);
    assertEquals_(x[0],d[1],'Nome divergente: '+code);assertEquals_(x[1],d[2],'Início divergente: '+code);assertEquals_(x[2],d[3],'Fim divergente: '+code);
    assertEquals_(x[3],d[4],'Delimitação de período divergente: '+code);assertEquals_(x[4],Number(d[5]||0),'Meta divergente: '+code);assertEquals_(x[5],d[6],'Efeito letivo divergente: '+code);assertEquals_(x[6],d[7],'Papel visual divergente: '+code);
    const rule=DEFAULT_ACADEMIC_AUDIT_RULES[code];
    if(!x[7]) assertTrue_(!rule,'Tipo não obrigatório não deve receber regra padrão: '+code);
    else {assertTrue_(!!rule,'Regra padrão ausente: '+code);assertEquals_(x[7],rule.expected,'Quantidade padrão divergente: '+code);assertEquals_(x[8],rule.rule,'Operador padrão divergente: '+code);assertEquals_('ANO',rule.unit,'Unidade padrão divergente: '+code);}
  });
}
function testPv12CanonicalSchoolPeriods_() {
  const byCode={};DEFAULT_EVENT_TYPES.forEach(function(d){byCode[d[0]]=d;});
  [['PERIODO_LETIVO_ANUAL','Anual',200],['PERIODO_LETIVO_1_SEMESTRE','1º Semestre',100],['PERIODO_LETIVO_2_SEMESTRE','2º Semestre',100]].forEach(function(x){const d=byCode[x[0]];assertTrue_(!!d,'Período padrão ausente: '+x[0]);assertEquals_(x[1],d[1],'Nome divergente.');assertTrue_(d[4]===true,'Período deve delimitar malha.');assertEquals_(x[2],d[5],'Meta divergente.');});
  assertTrue_(String(consolidateSchoolPeriodEventTypes_).indexOf('draftEventsRemoved')!==-1,'Setup deve sanear períodos legados em rascunhos.');
}
function testPv12SchoolDayModalHasNoPeriodRegistry_() {
  const html=HtmlService.createHtmlOutputFromFile('index').getContent();
  assertTrue_(html.indexOf('id="schoolDayPeriodList"')===-1,'Dias letivos não pode exibir lista de períodos.');
  assertTrue_(html.indexOf('Períodos usados na contagem')===-1,'Seção antiga de períodos deve ser removida.');
}
function testPv12CancelableLongOperations_() {
  const html=HtmlService.createHtmlOutputFromFile('index').getContent();
  assertTrue_(html.indexOf('id="cancelOperationBtn"')!==-1,'Operações longas precisam de comando visível de cancelamento.');
  assertTrue_(html.indexOf('function cancelActiveOperation(')!==-1,'Frontend deve liberar a interface ao cancelar.');
  assertTrue_(html.indexOf('.cancelOperation(token)')!==-1,'Cancelamento deve chegar ao backend.');
  assertTrue_(html.indexOf('if(!operationIsActive(token))return;')!==-1,'Respostas tardias de operações canceladas devem ser descartadas no cliente.');
  assertTrue_(html.indexOf("if(!win||win.closed)cancelActiveOperation('PREVIEW_CLOSED'")!==-1,'Fechar a Prévia durante seu processamento deve cancelar a operação.');
  const server=String(operationCancelKey_)+String(cancelOperation)+String(throwIfOperationCancelled_)+String(hardDeleteCalendarProject)+String(finalizeCalendarVersion)+String(getFinalizationReport)+String(publishCalendarVersion)+String(createRectificationVersion);
  assertTrue_(server.indexOf('CAL_OP_CANCEL_')!==-1,'Backend deve manter sinal de cancelamento por token.');
  assertTrue_((server.match(/throwIfOperationCancelled_\(progressToken\)/g)||[]).length>=12,'Operações longas precisam checar cancelamento cooperativo entre fases.');
}
function testPv12PdfFootnoteLabelsAndNoCrop_() {
  const source=String(schoolDayFootnoteHtml_)+String(previewCss_);
  ['Dias letivos por mês:','Dias Letivos por período letivo:','Total de dias letivos anuais:','75% dos dias letivos anuais previstos em:'].forEach(function(label){assertTrue_(source.indexOf(label)!==-1,'Rótulo obrigatório ausente: '+label);});
  assertTrue_(source.indexOf('overflow:visible')!==-1,'PDF deve ter fallback de não descarte por overflow.');
}


/** Agenda Pública C1: schema próprio, fachada pequena e integração no Projeto. */
function testPublicAgendaC1SchemaAndFacadeContract_() {
  ['PUBLIC_AGENDA_CONFIG','PUBLIC_AGENDAS','PUBLIC_AGENDA_SETTINGS','PUBLIC_AGENDA_TEMPLATES','SYSTEM_AUDIT'].forEach(function(name){
    assertTrue_(Array.isArray(DB_SCHEMA[name]), 'Tabela do módulo ausente no schema: '+name);
  });
  assertTrue_(Number((String(SCHEMA_VERSION).match(/pv(\d+)$/)||[])[1]||0)>=15,'Agenda Pública exige schema PV15 ou posterior.');
  ['getState','saveProjectConfig','saveInstitutionalSettings','saveTemplate','resetTemplate'].forEach(function(method){assertTrue_(typeof PublicAgenda[method]==='function','Fachada não expõe '+method+'.');});
  const projects=String(listProjects_)+String(projectRowToClient_);
  assertTrue_(projects.indexOf('buildPublicAgendaStateIndex_')!==-1 && projects.indexOf('publicAgenda')!==-1,'Projetos devem receber estado consolidado da Agenda Pública sem chamada externa.');
}

/** Agenda Pública C1: estados são derivados apenas da publicação e do último diagnóstico consolidado. */
function testPublicAgendaC1StateContract_() {
  const published={id:'CAL-PUB'};
  let state=publicAgendaStateFromRows_(null,null);
  assertEquals_('NOT_CREATED',state.code,'Projeto sem agenda deve iniciar como não criada.');
  assertFalse_(state.available,'Sem versão publicada a criação deve permanecer indisponível.');
  state=publicAgendaStateFromRows_(published,null);
  assertEquals_('NOT_CREATED',state.code,'Versão publicada sem agenda continua não criada.');
  assertTrue_(state.available,'Versão publicada deve habilitar criação.');
  const base={id:'PA-1',project_id:'PRJ-1',google_calendar_id:'gcal',status:'ACTIVE',last_synced_calendar_id:'CAL-PUB',last_diagnostic_status:'IDENTICAL',version:1};
  state=publicAgendaStateFromRows_(published,base);
  assertEquals_('UPDATED',state.code,'Identidade confirmada com a publicação vigente deve ser atualizada.');
  const newer={id:'CAL-NEW'};
  state=publicAgendaStateFromRows_(newer,base);
  assertEquals_('OUTDATED',state.code,'Nova publicação deve deixar a agenda desatualizada sem considerar rascunhos.');
  state=publicAgendaStateFromRows_(published,Object.assign({},base,{last_diagnostic_status:'DIFFERENT'}));
  assertEquals_('OUTDATED',state.code,'Diagnóstico divergente nunca pode exibir criada e atualizada.');
}

/** Agenda Pública C1: e-mail aceita listas institucionais, valida somente sintaxe e proíbe duplicação cruzada. */
function testPublicAgendaC1RecipientValidationContract_() {
  let result=validatePublicAgendaRecipients_({to:['aluno@instituicao.edu.br','lista-geral@instituicao.edu.br'],cc:'gestao@instituicao.edu.br',bcc:''});
  assertTrue_(result.ok,'Destinatários sintaticamente válidos e listas de distribuição devem ser aceitos.');
  assertEquals_(2,result.to.length,'Campo Para deve aceitar zero ou mais endereços.');
  result=validatePublicAgendaRecipients_({to:'Pessoa@Instituicao.edu.br',cc:'pessoa@instituicao.edu.br'});
  assertFalse_(result.ok,'Mesmo endereço em campos distintos deve ser bloqueado sem diferenciar caixa.');
  assertEquals_('DUPLICATE_RECIPIENT',result.code,'Duplicidade deve ter erro próprio.');
  result=validatePublicAgendaRecipients_({to:'invalido sem arroba',cc:'',bcc:''});
  assertFalse_(result.ok,'Validação sintática deve rejeitar endereço impossível.');
  assertEquals_('INVALID_EMAIL',result.code,'E-mail inválido deve ter diagnóstico claro.');
  result=validatePublicAgendaRecipients_({to:'',cc:'',bcc:''});
  assertTrue_(result.ok,'Todos os campos podem estar vazios.');
}

/** Agenda Pública C1: identidade e templates são globais, pré-preenchidos e editáveis só pelo Superusuário. */
function testPublicAgendaC1TemplatesAndGlobalIdentityContract_() {
  const defs=publicAgendaDefaultTemplateDefinitions_();
  assertEquals_(4,defs.length,'Módulo deve nascer com quatro templates institucionais.');
  ['WELCOME','UPDATE','REMINDER','CLOSURE'].forEach(function(type){assertTrue_(defs.some(function(item){return item.type===type;}),'Template padrão ausente: '+type);});
  const welcome=defs.filter(function(item){return item.type==='WELCOME';})[0];
  assertTrue_(welcome.html_template.indexOf('Adicione apenas uma vez')!==-1,'Boas-vindas deve explicar o benefício principal sem texto longo.');
  assertTrue_((welcome.html_template.indexOf('{{agenda_cta}}')!==-1||welcome.html_template.indexOf('{{agenda_url}}')!==-1) && welcome.text_template.indexOf('{{agenda_url}}')!==-1 && welcome.subject_template.indexOf('{{project_name}}')!==-1,'Template deve usar variáveis do módulo e manter o link da agenda na versão texto.');
  assertFalse_(validatePublicAgendaTemplateVariables_(welcome.html_template).length>0,'Template padrão não pode nascer com variável desconhecida.');
  assertTrue_(String(savePublicAgendaGlobalSettings).indexOf('requirePublicAgendaSuperuser_')!==-1,'Identidade institucional global deve ser restrita ao Superusuário.');
  assertTrue_(String(savePublicAgendaTemplate).indexOf('requirePublicAgendaSuperuser_')!==-1,'Edição de template global deve ser restrita ao Superusuário.');
  assertTrue_(String(seedPublicAgendaModule_).indexOf('PUBLIC_AGENDA_EXECUTOR_SECRET_PROPERTY')!==-1,'Setup deve provisionar segredo interno sem expô-lo ao usuário.');
}


/** Agenda Pública C2: executor institucional é assinado, anti-replay e isolado da UI. */
function testPublicAgendaC2ExecutorSecurityContract_() {
  const code=String(publicAgendaInvokeExecutor_)+String(publicAgendaVerifyExecutorRequest_)+String(doPost)+String(configurePublicAgendaExecutor);
  assertTrue_(code.indexOf('computeHmacSha256Signature')!==-1 || String(publicAgendaSignRequest_).indexOf('computeHmacSha256Signature')!==-1,'Executor deve usar HMAC-SHA256.');
  assertTrue_(String(publicAgendaVerifyExecutorRequest_).indexOf('PA_EXEC_NONCE_')!==-1,'Executor deve impedir replay por nonce.');
  assertTrue_(String(publicAgendaVerifyExecutorRequest_).indexOf('PUBLIC_AGENDA_EXECUTOR_MAX_SKEW_MS')!==-1,'Executor deve rejeitar requisições antigas.');
  assertTrue_(String(configurePublicAgendaExecutor).indexOf('requirePublicAgendaSuperuser_')!==-1,'Somente Superusuário configura o deployment institucional.');
  assertTrue_(String(publicAgendaExecutorDispatch_).indexOf("action==='PING'")!==-1,'Executor precisa expor diagnóstico de identidade.');
}

/** Agenda Pública C2: projeção usa exclusivamente versão publicada congelada e preserva marcos/feriados/exceções. */
function testPublicAgendaC2PublishedProjectionContract_() {
  const code=String(buildPublicAgendaExpectedPayload_);
  assertTrue_(code.indexOf('getVersionMaterializedData_(publishedVersion.id)')!==-1,'Projeção deve consumir a materialização congelada da publicação.');
  assertTrue_(code.indexOf("'Início do '+base")!==-1 && code.indexOf("'Fim do '+base")!==-1,'Períodos letivos devem virar dois marcos canônicos.');
  assertTrue_(code.indexOf("'HOLIDAY:'")!==-1 && code.indexOf("'HOLIDAY_OCC:'")!==-1,'Feriados fixos e variáveis devem compor o espelho público.');
  assertTrue_(code.indexOf("'SCHOOL_EXCEPTION:'")!==-1,'Dias letivos excepcionais devem compor o espelho público.');
  assertTrue_(code.indexOf('publicAgendaExpectedEventId_')!==-1,'Cada ocorrência deve ter ID Google determinístico para idempotência.');
  assertTrue_(String(publicAgendaGoogleEventResource_).indexOf('extendedProperties')!==-1 && String(publicAgendaGoogleEventResource_).indexOf('caSourceKey')!==-1,'Evento Google deve carregar chave privada de origem.');
}

/** Agenda Pública C2: diagnóstico é semântico e sincronização sempre termina por reconferência. */
function testPublicAgendaC2DiagnosticAndSyncContract_() {
  const compare=String(comparePublicAgendaEvents_);
  ['MISSING','CHANGED','EXTRA'].forEach(function(kind){assertTrue_(compare.indexOf("'"+kind+"'")!==-1,'Diagnóstico deve classificar '+kind+'.');});
  ['título','dia inteiro','data inicial','data final','descrição'].forEach(function(field){assertTrue_(compare.indexOf(field)!==-1,'Diagnóstico deve conferir '+field+'.');});
  const sync=String(publicAgendaExecutorSync_);
  assertTrue_(sync.indexOf('Calendar.Events.insert')!==-1 && sync.indexOf('Calendar.Events.update')!==-1 && sync.indexOf('Calendar.Events.remove')!==-1,'Sincronização deve criar, alterar e remover para restaurar o espelho.');
  assertTrue_(sync.indexOf('comparePublicAgendaEvents_(expected,finalActual)')!==-1,'Sincronização não pode declarar sucesso sem diagnóstico final.');
  assertTrue_(String(publicAgendaStateFromRows_).indexOf("lastDiagnosticStatus === PUBLIC_AGENDA_DIAGNOSTIC.IDENTICAL")!==-1,'Estado atualizada exige diagnóstico 100% idêntico.');
  assertTrue_(String(publicAgendaExecutorCreate_).indexOf('Calendar.Calendars.remove(created.id)')!==-1,'Falha na criação deve induzir rollback da Google Agenda parcial.');
}

/** Agenda Pública C2: teste mensal é parcial e exclusão é externa primeiro, local depois. */
function testPublicAgendaC2TestMonthAndDeletionContract_() {
  const month=String(syncPublicAgendaTestMonth)+String(publicAgendaMonthBounds_)+String(publicAgendaListGoogleEvents_);
  assertTrue_(month.indexOf("'SYNC_MONTH'")!==-1,'Teste mensal deve ter ação própria.');
  assertTrue_(month.indexOf('timeMin')!==-1 && month.indexOf('timeMax')!==-1,'Executor deve limitar a consulta ao mês selecionado.');
  assertFalse_(String(syncPublicAgendaTestMonth).indexOf('publicAgendaPersistDiagnostic_')!==-1,'Teste mensal não pode promover o estado global da Agenda como sincronizado.');
  const del=String(deletePublicAgenda);
  assertTrue_(del.indexOf("publicAgendaInvokeExecutor_('DELETE'")!==-1,'Exclusão deve apagar primeiro a Google Agenda.');
  assertTrue_(del.indexOf('publicAgendaDeleteLocalLinkVerified_')!==-1 && String(publicAgendaDeleteLocalLinkVerified_).indexOf("deleteRowsMatching_(getRequiredSheet_('PUBLIC_AGENDAS')")!==-1,'Somente depois do sucesso externo o vínculo local deve ser removido por limpeza verificada.');
  assertFalse_(del.indexOf("PUBLIC_AGENDA_CONFIG")!==-1,'Excluir a Agenda não deve apagar destinatários/configuração do Projeto.');
}

/** Agenda Pública C3: UI profissional integrada à Gaveta, com estado acionável e progresso local. */
function testPublicAgendaC3ProfessionalUiContract_() {
  const html=HtmlService.createHtmlOutputFromFile('index').getContent();
  ['projectsTabPublicAgenda','projectsPanelPublicAgenda','publicAgendaStatePill','publicAgendaDiagnostic','publicAgendaMailModal','publicAgendaTemplateEditor'].forEach(function(id){assertTrue_(html.indexOf('id="'+id+'"')!==-1,'Componente obrigatório da Agenda Pública ausente: '+id);});
  assertTrue_(html.indexOf('Agenda Pública</span>')!==-1 || html.indexOf('Agenda Pública</div>')!==-1 || html.indexOf('Agenda Pública')!==-1,'A aba/coluna Agenda Pública deve estar identificada.');
  const stateCode=String(publicAgendaStateFromRows_);assertTrue_(html.indexOf('Não criada')!==-1 && stateCode.indexOf('Criada e atualizada')!==-1 && stateCode.indexOf('Criada e desatualizada')!==-1,'A UI deve exibir o estado recebido e o backend deve fornecer os três rótulos operacionais.');
  const beginIndex=html.indexOf('function beginPublicAgendaOperation');const beginEnd=html.indexOf('function finishPublicAgendaOperation',beginIndex);const beginCode=html.slice(beginIndex,beginEnd);
  assertTrue_(beginCode.indexOf('setPublicAgendaBusy')!==-1,'Operações longas da Agenda devem usar progresso local próprio.');
  assertFalse_(beginCode.indexOf('beginCancelableOperation')!==-1 || beginCode.indexOf('setSaving')!==-1,'Agenda Pública não pode reutilizar o escudo exclusivo de Prévia/PDF.');
  assertTrue_(html.indexOf('publicAgendaProgressPercent')!==-1 && html.indexOf('publicAgendaCancelOperationBtn')!==-1,'Progresso local deve mostrar percentual e permitir cancelamento.');
}

/** Agenda Pública C3: criar/atualizar/excluir apenas prepara comunicação; nenhum e-mail é automático. */
function testPublicAgendaC3NoAutomaticCommunicationContract_() {
  const html=HtmlService.createHtmlOutputFromFile('index').getContent();
  function clientFn_(name,next){const start=html.indexOf('function '+name);const end=html.indexOf('function '+next,start+1);return start>=0?html.slice(start,end>start?end:html.length):'';}
  const createCode=clientFn_('createPublicAgendaFromPanel','updatePublicAgendaFromPanel'),updateCode=clientFn_('updatePublicAgendaFromPanel','publicAgendaClientSummaryText'),deleteCode=clientFn_('confirmPublicAgendaDelete','configurePublicAgendaExecutorFromPanel');
  [createCode,updateCode,deleteCode].forEach(function(code){assertTrue_(code.indexOf('openPublicAgendaCommunicationPreview')!==-1,'Fluxo deve oferecer prévia de comunicação após concluir a operação.');assertFalse_(code.indexOf('.sendPublicAgendaCommunication(')!==-1,'Fluxo operacional nunca pode enviar e-mail automaticamente.');});
  assertTrue_(updateCode.indexOf("changed?'UPDATE':'REMINDER'")!==-1,'Atualização sem mudança real deve oferecer lembrete, sem alegar alteração.');
  assertTrue_(deleteCode.indexOf("'CLOSURE'")!==-1,'Exclusão deve oferecer comunicação somente depois de concluir a remoção.');
  assertTrue_(html.indexOf('Confirmar e enviar')!==-1 && html.indexOf('Não enviar agora')!==-1,'Envio deve exigir confirmação explícita em uma etapa separada.');
}

/** Agenda Pública C3: editor visual é global, pré-preenchido e sanitiza conteúdo perigoso. */
function testPublicAgendaC3WysiwygAndTemplateSafetyContract_() {
  const html=HtmlService.createHtmlOutputFromFile('index').getContent();
  assertTrue_(html.indexOf('contenteditable="true"')!==-1,'Templates devem possuir editor WYSIWYG visual.');
  assertTrue_(html.indexOf('publicAgendaTemplateToolbar')!==-1,'Editor deve oferecer barra de formatação controlada.');
  assertTrue_(String(savePublicAgendaTemplate).indexOf('requirePublicAgendaSuperuser_')!==-1,'Somente Superusuário pode salvar template global.');
  const defs=publicAgendaDefaultTemplateDefinitions_();assertEquals_(4,defs.length,'Quatro templates globais devem vir pré-preenchidos.');
  const dirty='<p onclick="x()">Olá</p><script>alert(1)</script><a href="javascript:alert(2)">x</a><div style="position:fixed;background:red">y</div>';
  const clean=sanitizePublicAgendaTemplateHtml_(dirty);
  assertFalse_(clean.toLowerCase().indexOf('<script')!==-1,'Sanitizador deve remover scripts.');
  assertFalse_(clean.toLowerCase().indexOf('onclick=')!==-1,'Sanitizador deve remover event handlers.');
  assertFalse_(clean.toLowerCase().indexOf('javascript:')!==-1,'Sanitizador deve remover URLs javascript.');
  assertFalse_(clean.toLowerCase().indexOf('position:fixed')!==-1,'Sanitizador deve remover posicionamento perigoso.');
}

/** Agenda Pública C3: token efêmero vincula revisão ao usuário e Gmail envia como usuário logado. */
function testPublicAgendaC3ExplicitSendAndSenderContract_() {
  const prepare=String(preparePublicAgendaCommunication),send=String(sendPublicAgendaCommunication),mime=String(publicAgendaBuildRawMime_);
  assertTrue_(prepare.indexOf('CacheService.getScriptCache().put')!==-1 && prepare.indexOf('confirmationToken')!==-1,'Prévia deve criar token efêmero de confirmação.');
  assertTrue_(send.indexOf('CONFIRMATION_EXPIRED')!==-1 && send.indexOf('CONFIRMATION_MISMATCH')!==-1,'Envio deve rejeitar confirmação expirada ou de outro usuário/Projeto.');
  assertTrue_(send.indexOf('cache.remove(key)')!==-1,'Token deve ser consumido antes do envio para evitar duplicação acidental.');
  assertTrue_(send.indexOf("Gmail.Users.Messages.send({raw:encoded},'me')")!==-1,'Gmail deve enviar pela conta do usuário logado que confirmou.');
  assertTrue_(mime.indexOf('From: '+"'+actor")!==-1 || mime.indexOf("'From: '+actor")!==-1,'MIME deve declarar o usuário executor como remetente.');
  assertTrue_(mime.indexOf("'To: '")!==-1 && mime.indexOf("'Cc: '")!==-1 && mime.indexOf("'Bcc: '")!==-1,'Composição deve preservar Para, Cc e Cco separadamente.');
}

/** Agenda Pública C3: auditoria global preserva HTML integral sem estourar limite da célula. */
function testPublicAgendaC3AuditPayloadContract_() {
  const audit=String(appendSystemAudit_),send=String(sendPublicAgendaCommunication);
  assertTrue_(audit.indexOf("getRequiredSheet_('SYSTEM_AUDIT_CHUNKS')")!==-1 && audit.indexOf("'CHUNKED:'")!==-1,'Payload grande deve ser fragmentado na auditoria global.');
  assertTrue_(send.indexOf('html:payload.html')!==-1 && send.indexOf('subject:payload.subject')!==-1,'Auditoria de envio deve guardar HTML final e assunto realmente enviados.');
  assertTrue_(send.indexOf('to:recipients.to')!==-1 && send.indexOf('cc:recipients.cc')!==-1 && send.indexOf('bcc:recipients.bcc')!==-1,'Auditoria deve guardar os destinatários efetivos por campo.');
  assertTrue_(String(PublicAgenda.prepareCommunication)!=='undefined' && String(PublicAgenda.sendCommunication)!=='undefined','Fachada do módulo deve expor preparar e enviar comunicação ao sistema principal.');
}

/** Agenda Pública C4: falha de leitura/escrita externa nunca pode preservar falsamente o selo Atualizada. */
function testPublicAgendaC4FailureDemotesStateContract_() {
  assertTrue_(String(publicAgendaPersistFailure_).indexOf('PUBLIC_AGENDA_DIAGNOSTIC.FAILED')!==-1,'Falha operacional deve consolidar diagnóstico FAILED.');
  [updatePublicAgenda,diagnosePublicAgenda,syncPublicAgendaTestMonth].forEach(function(fn){assertTrue_(String(fn).indexOf('publicAgendaHandleRemoteFailure_')!==-1,fn.name+' deve rebaixar estado após falha externa/partial pelo tratador central.');});
  const handler=String(publicAgendaHandleRemoteFailure_);assertTrue_(handler.indexOf('publicAgendaPersistFailure_')!==-1&&handler.indexOf('publicAgendaPersistExternalMissing_')!==-1,'Tratador central deve separar falha operacional comum de Agenda externa inexistente.');
  assertTrue_(String(publicAgendaStateFromRows_).indexOf('lastDiagnosticStatus === PUBLIC_AGENDA_DIAGNOSTIC.IDENTICAL')!==-1,'Somente diagnóstico IDENTICAL pode exibir Criada e atualizada.');
}

/** Agenda Pública C4: operações distribuídas possuem compensação ou recuperação explícita. */
function testPublicAgendaC4DistributedCompensationContract_() {
  const create=String(createPublicAgenda),metadata=String(updatePublicAgendaMetadata),del=String(deletePublicAgenda);
  assertTrue_(create.indexOf('publicAgendaCleanupExternalCalendar_')!==-1 && create.indexOf('LOCAL_CREATE_PERSIST_FAILED')!==-1,'Falha de persistência local após criar Agenda externa deve removê-la compensatoriamente.');
  assertFalse_(create.indexOf("publicAgendaInvokeExecutor_('DELETE',{googleCalendarId:result.googleCalendarId},'');return failure_('AGENDA_EXISTS'")!==-1,'Executor externo não deve ser chamado enquanto o ScriptLock de persistência está mantido.');
  assertTrue_(metadata.indexOf("metadata:{name:previous.name,description:previous.description,timezone:previous.timezone}")!==-1,'Falha local de metadados deve tentar restaurar os valores externos anteriores.');
  assertTrue_(del.indexOf('publicAgendaDeleteLocalLinkVerified_')!==-1 && String(publicAgendaDeleteLocalLinkVerified_).indexOf('attempt<=3')!==-1,'Após exclusão externa, vínculo local deve ter limpeza verificada/repetível.');
  assertTrue_(del.indexOf('REMOTE_DELETED_LOCAL_CLEANUP_FAILED')!==-1,'Falha irrecuperável de limpeza local deve ser explicitada sem fingir sucesso total.');
}

/** R15: duplicação de Projeto saiu da UX; Retificar é a única clonagem de calendário exposta. */
function testR15RectificationOnlyCloneUxContract_() {
  const html=HtmlService.createHtmlOutputFromFile('index').getContent();
  ['duplicateProjectBtn','projectDuplicatePanel','projectDuplicateName','confirmProjectDuplicateBtn','cancelProjectDuplicateOperationBtn'].forEach(function(id){assertFalse_(html.indexOf('id="'+id+'"')!==-1,'A UX não pode expor duplicação paralela ao fluxo de Retificar: '+id);});
  assertFalse_(html.indexOf('function beginProjectDuplicate')!==-1 || html.indexOf('.duplicateCalendarProject(')!==-1,'Frontend não pode manter handler/call de duplicação de Projeto.');
  assertTrue_(html.indexOf('id="projectRetifyBtn"')!==-1 && html.indexOf('.createRectificationVersion(')!==-1,'Retificar Calendário deve permanecer como única ação de clonagem editável.');
  assertTrue_(String(getProjectDeleteImpact).indexOf('publicAgendaExists')!==-1,'Impacto da exclusão do Projeto deve informar Agenda Pública existente.');
  assertTrue_(String(hardDeleteCalendarProject).indexOf('PUBLIC_AGENDA_MUST_BE_DELETED_FIRST')!==-1,'Hard Delete deve exigir exclusão prévia da Agenda Google para evitar órfãos externos.');
  assertTrue_(String(hardDeleteCalendarProject).indexOf("getRequiredSheet_('PUBLIC_AGENDA_CONFIG')")!==-1,'Hard Delete deve continuar limpando configuração/destinatários do Projeto.');
}



/** Agenda Pública C4: criação distribuída descarta cópia externa se publicação mudar ou houver concorrência. */
function testPublicAgendaC4CreateRaceAndPublicationChangeContract_() {
  const code=String(createPublicAgenda);
  assertTrue_(code.indexOf('currentPublished=getPublishedVersionForProject_(id)')!==-1 && code.indexOf("failure_('PUBLICATION_CHANGED'")!==-1,'Criação deve reler a publicação antes de persistir o vínculo.');
  assertTrue_(code.indexOf('publicAgendaCleanupExternalCalendar_(externalId)')!==-1,'Mudança de publicação deve remover a Google Agenda criada nesta tentativa.');
  assertTrue_(code.indexOf('race=!!getPublicAgendaRowForProject_(id)')!==-1 && code.indexOf("const code=race?'AGENDA_EXISTS':'LOCAL_CREATE_PERSIST_FAILED'")!==-1,'Concorrência deve ser detectada dentro do ScriptLock e tratada sem duplicar Agenda por Projeto.');
  assertTrue_(code.indexOf("failure_('CREATE_ROLLBACK_FAILED'")!==-1,'Falha da compensação externa deve ser explicitada e nunca mascarada como sucesso.');
}

/** Agenda Pública C4: metadados distribuídos possuem compensação e estado explícito quando ela também falha. */
function testPublicAgendaC4MetadataReconciliationContract_() {
  const code=String(updatePublicAgendaMetadata);
  assertTrue_(code.indexOf("publicAgendaInvokeExecutor_('UPDATE_METADATA'")!==-1,'Edição deve atualizar os metadados na Agenda externa.');
  assertTrue_(code.indexOf('name:previous.name,description:previous.description,timezone:previous.timezone')!==-1,'Falha local deve restaurar os metadados externos anteriores.');
  assertTrue_(code.indexOf("failure_('LOCAL_METADATA_SAVE_FAILED'")!==-1,'Compensação bem-sucedida deve retornar falha local recuperada.');
  assertTrue_(code.indexOf("failure_('METADATA_RECONCILIATION_REQUIRED'")!==-1,'Falha também na compensação deve sinalizar reconciliação administrativa obrigatória.');
}

/** R15: retificação nasce do snapshot PUBLICATION e só é exposta após releitura/validação integral. */
function testR15RectificationSnapshotCloneIntegrityContract_() {
  const writer=String(cloneCalendarScopedRows_),groupWriter=String(clonePublishedVersionRows_),create=String(createRectificationVersion),mechanical=String(validateRectificationMechanicalCopy_),finalize=String(finalizeCalendarVersion),literal=String(cloneSheetLiteralWriteValue_);
  assertTrue_(writer.indexOf('getValues()')!==-1&&writer.indexOf('getNumberFormats()')!==-1&&writer.indexOf('setNumberFormats')!==-1&&writer.indexOf('setValues')!==-1,'Clonagem deve reproduzir valores e formatos diretamente da linha de origem.');
  assertTrue_(groupWriter.indexOf('CALENDAR_CLONE_SCOPED_TABLES.forEach')!==-1&&groupWriter.indexOf('cloneCalendarScopedRows_')!==-1,'Todas as tabelas calendar-scoped devem usar o mesmo CTRL+C/CTRL+V mecânico.');
  assertTrue_(literal.indexOf("value.charAt(0)==='='")!==-1&&literal.indexOf("return \"'\"+value")!==-1,'Texto iniciado por = deve ser escapado na escrita para não virar fórmula do Sheets.');
  assertFalse_(create.indexOf('getVersionMaterializedData_')!==-1||create.indexOf('buildSchoolDayModel_')!==-1||create.indexOf('buildFinalizationReport_')!==-1,'Retificar não pode executar regras de negócio, malha letiva ou Checklist.');
  assertTrue_(create.indexOf('clonePublishedVersionRows_')!==-1&&create.indexOf('validateRectificationMechanicalCopy_')!==-1,'Criação deve copiar e apenas conferir mecanicamente o que foi persistido.');
  assertTrue_(mechanical.indexOf('validateCalendarScopedClone_')!==-1&&mechanical.indexOf('cloneComparableTheme_')!==-1,'Conferência admissível é somente igualdade mecânica de linhas e aparência.');
  const html=HtmlService.createHtmlOutputFromFile('index').getContent();
  assertTrue_(html.indexOf("beginMeasuredOperation('Criando nova versão — copiando a publicação para a Mesa…',6)")!==-1,'Progresso deve refletir as seis etapas simples da cópia.');
  assertFalse_(finalize.indexOf('RECTIFICATION_CLONE_UNVERIFIED')!==-1,'Finalização deve validar o calendário pelas regras normais, não por selo da clonagem.');
}

/** R15: reconciliação nunca apaga silenciosamente uma retificação em preparação. */
function testR15RectificationRecoveryPreservesDraftContract_() {
  const reconcile=String(reconcileIncompleteRectificationsUnderLock_),boot=String(getBootstrapData),drawer=String(getProjectsWorkspaceData),setup=String(runSetupMenuStep_),cleanup=String(cleanupFailedRectification_);
  assertTrue_(reconcile.indexOf('mutated:0')!==-1&&reconcile.indexOf('preserved')!==-1,'Compatibilidade de reconciliação deve apenas contar Rascunhos preservados.');
  assertFalse_(reconcile.indexOf('deleteRowsMatching_')!==-1||reconcile.indexOf('writeObjectToRow_')!==-1||reconcile.indexOf('cleanupFailedRectification')!==-1,'Reconciliação não pode escrever, reparar ou excluir versão existente.');
  assertFalse_(boot.indexOf('reconcileIncompleteRectifications_')!==-1||drawer.indexOf('reconcileIncompleteRectifications_')!==-1||setup.indexOf('reconcileIncompleteRectificationsUnderLock_')!==-1,'BOOT, Setup e Gaveta não podem acionar reconciliação de Rascunhos.');
  assertTrue_(cleanup.indexOf('Rollback estritamente local')!==-1,'Hard-delete automático deve existir somente como rollback da mesma chamada que ainda cria a versão.');
}

/** R14: feedback da Agenda Pública permanece na faixa fixa da Gaveta, fora dos painéis roláveis. */
function testR14FrozenDrawerFeedbackContract_() {
  const html=HtmlService.createHtmlOutputFromFile('index').getContent(),feedback=html.indexOf('id="projectFeedback"'),tabs=html.indexOf('id="projectsTabs"'),panel=html.indexOf('id="projectsPanelProjects"');
  assertTrue_(feedback!==-1&&feedback<tabs&&tabs<panel,'Faixa de comunicação deve ficar estruturalmente acima das abas/painéis roláveis da Gaveta.');
  assertTrue_(html.indexOf('id="publicAgendaFeedback" role="status" hidden aria-hidden="true"')!==-1,'Feedback antigo da Agenda deve permanecer inerte apenas por compatibilidade.');
  const routed=(html.match(/el\.projectFeedback/g)||[]).length,legacy=(html.match(/el\.publicAgendaFeedback/g)||[]).length;
  assertTrue_(routed>10,'Operações da Agenda Pública devem usar a faixa de feedback da Gaveta.');
  assertEquals_(0,legacy,'Nenhuma rotina deve voltar a escrever na faixa rolável antiga.');
  const openDrawer=html.slice(html.indexOf('function openProjectsModal'),html.indexOf('function closeProjectsModal'));
  assertTrue_(openDrawer.indexOf('.getProjectsWorkspaceData()')!==-1,'A Gaveta deve continuar atualizando sua lista a partir da base canônica.');
  assertFalse_(openDrawer.indexOf('legacyRepaired')!==-1||openDrawer.indexOf('legacyBlocked')!==-1,'Abrir a Gaveta não pode executar/retratar reparo automático de Rascunhos.');
}

/** R14: prévia de e-mail usa metadados horizontais, documento em largura útil e ações normais no rodapé. */
function testR14MailPreviewProfessionalLayoutContract_() {
  const html=HtmlService.createHtmlOutputFromFile('index').getContent(),layout=html.indexOf('class="pa-mail-layout"'),meta=html.indexOf('class="pa-mail-meta"',layout),preview=html.indexOf('class="pa-mail-preview"',meta),actions=html.indexOf('class="pa-mail-actions"',preview);
  assertTrue_(layout!==-1&&meta<preview&&preview<actions,'Metadados devem ficar acima da prévia e ações depois do documento.');
  assertTrue_(html.indexOf('.pa-mail-layout { min-height:0; display:grid; grid-template-rows:auto minmax(0,1fr)')!==-1,'Prévia deve usar composição vertical e largura integral.');
  assertTrue_(html.indexOf('.pa-mail-meta { border-bottom:1px solid var(--line)')!==-1,'Metadados devem ser faixa horizontal superior.');
  assertTrue_(html.indexOf("previewOnly?'Fechar':'Não enviar agora'")!==-1,'Prévia simples deve usar botão Fechar normal no rodapé.');
}



/** R15: Agenda Pública segue ordem visual definida e mantém Configuração/Destinatários lado a lado. */
function testR15PublicAgendaSectionOrderContract_() {
  const html=HtmlService.createHtmlOutputFromFile('index').getContent();
  const ids=['publicAgendaBrandingCard','publicAgendaConfigCard','publicAgendaRecipientsCard','publicAgendaIntegrationCard','publicAgendaTemplatesCard','publicAgendaTestingCard'];
  const positions=ids.map(function(id){return html.indexOf('id="'+id+'"');});
  positions.forEach(function(pos,index){assertTrue_(pos!==-1,'Seção ausente na Agenda Pública: '+ids[index]);});
  for(let i=1;i<positions.length;i++)assertTrue_(positions[i-1]<positions[i],'Ordem lógica da Agenda Pública divergente em '+ids[i]+'.');
  assertTrue_(html.indexOf('id="publicAgendaTestingCard"')!==-1&&html.indexOf('class="pa-card pa-card-full" id="publicAgendaTestingCard"')!==-1,'Conferência e testes deve ocupar largura integral.');
  assertTrue_(html.indexOf('id="publicAgendaConfigCard"')!==-1&&html.indexOf('id="publicAgendaRecipientsCard"')!==-1,'Configuração da Agenda e Destinatários devem formar o par lado a lado na grade principal.');
}

/** R15: ativação usa somente URLs públicas documentadas pelo Google e trata permissão como ação guiada. */
function testR15PublicAgendaOfficialActivationLinksContract_() {
  const status=String(getPublicAgendaActivationStatus_),html=HtmlService.createHtmlOutputFromFile('index').getContent();
  assertTrue_(status.indexOf("'https://script.google.com/d/'+encodeURIComponent(scriptId)+'/edit'")!==-1,'Editor do projeto deve usar a URL pública documentada /d/<scriptId>/edit.');
  assertTrue_(status.indexOf("'https://script.google.com/home/usersettings'")!==-1,'Permissão da API Apps Script deve apontar para a página oficial de configurações do usuário.');
  assertTrue_(status.indexOf('appsScriptApiEnableUrl')!==-1&&status.indexOf('calendarApiEnableUrl')!==-1&&status.indexOf('gmailApiEnableUrl')!==-1,'Ativação no Cloud deve expor links próprios para Apps Script, Calendar e Gmail no projeto correto.');
  assertFalse_(status.indexOf('console.developers.google.com/start/api?hl=pt-br&id=script')!==-1,'Wizard não pode usar URL genérica que permita habilitar API no projeto errado.');
  assertTrue_(status.indexOf('ScriptApp.getAuthorizationInfo')!==-1&&status.indexOf('oauthAuthorizationUrl')!==-1,'Wizard deve usar o URL de autorização fornecido pelo próprio Apps Script quando faltar consentimento OAuth.');
  assertFalse_(status.indexOf('/home/projects/')!==-1||html.indexOf('/home/projects/')!==-1,'Não pode existir deep-link interno não documentado de gerenciamento de deployments.');
  assertTrue_(html.indexOf('Abrir projeto no Apps Script')!==-1&&html.indexOf('Implantar → Nova implantação')!==-1,'Wizard deve orientar a criação da implantação pelo editor oficial.');
  assertTrue_(html.indexOf('id="publicAgendaOpenOAuthAuthorizationBtn"')!==-1,'Consentimento OAuth pendente deve ter ação própria usando o URL retornado pelo Google.');
  assertTrue_(String(discoverAndActivatePublicAgendaExecutor).indexOf("DEPLOYMENT_DISCOVERY_OAUTH_REQUIRED")!==-1,'Backend deve distinguir consentimento OAuth de acesso da API desativado.');
  const discovery=html.slice(html.indexOf('function discoverPublicAgendaIntegrationFromActivation'),html.indexOf('function verifyPublicAgendaIntegrationFromPanel'));
  assertTrue_(discovery.indexOf("false,'warning'")!==-1,'Permissão pendente deve ser apresentada como ação necessária, não como falha técnica do usuário.');
}

/** R15: falhas internas da clonagem não vazam INVARIANT/CLONE para o usuário. */
function testR15RectificationInternalFailureUxContract_() {
  const create=String(createRectificationVersion);
  assertTrue_(create.indexOf("failure_('RECTIFICATION_INTERNAL_ERROR'")!==-1,'Falha interna deve retornar mensagem operacional estruturada.');
  assertTrue_(create.indexOf("appendSystemAudit_('VERSIONS','RECTIFICATION_CREATE_FAILED'")!==-1,'Detalhe técnico da falha deve ficar na Auditoria.');
  assertFalse_(create.indexOf('throw combined')!==-1,'Falha de rollback não deve vazar exceção técnica crua para a interface.');
  assertTrue_(create.indexOf('Nenhuma cópia incompleta foi disponibilizada')!==-1,'Mensagem ao usuário deve confirmar que nenhuma versão inconsistente foi liberada.');
}

/** R16: o writer real do Sheets deve copiar '=' como texto literal, nunca como fórmula. */
function testR16RectificationLiteralEqualsRuntimeContract_() {
  const ss=getDatabase_(),name='_R16_CLONE_'+Utilities.getUuid().replace(/-/g,'').slice(0,10);
  let sheet=null;
  try {
    sheet=ss.insertSheet(name);
    sheet.getRange(1,1,1,8).setValues([['id','calendar_id','quantity_rule','created_at','created_by','updated_at','updated_by','version']]);
    sheet.getRange(2,1,1,8).setValues([['SRC-1','SRC','','2026-01-01T00:00:00.000Z','tester','2026-01-01T00:00:00.000Z','tester',1]]);
    sheet.getRange(2,3).setNumberFormat('@');
    sheet.getRange(2,3).setValue("'=");
    cloneCalendarScopedRows_(name,'SRC','DST','tester','2026-01-02T00:00:00.000Z');
    SpreadsheetApp.flush();
    const cell=sheet.getRange(3,3);
    assertEquals_('',cell.getFormula(),'Operador = clonado não pode se transformar em fórmula.');
    assertEquals_('=',String(cell.getValue()),'Operador = deve permanecer texto literal após CTRL+C/CTRL+V.');
    assertEquals_('@',cell.getNumberFormat(),'Formato texto da célula de origem deve ser preservado na cópia.');
  } finally {
    if(sheet)ss.deleteSheet(sheet);
  }
}


/** R17: 404/Not Found torna a Agenda externa explicitamente ausente e elimina links mortos. */
function testR17PublicAgendaExternalMissingStateContract_() {
  const published={id:'CAL-PUBLISHED'},legacy={status:'ACTIVE',google_calendar_id:'dead@group.calendar.google.com',last_diagnostic_status:'FAILED',last_diagnostic_json:JSON.stringify({code:'GOOGLE_CALENDAR_READ_FAILED',message:'API call failed: Not Found'}),public_url:'https://calendar.google.com/dead',embed_url:'https://calendar.google.com/embed/dead'};
  assertTrue_(publicAgendaRowIndicatesExternalMissing_(legacy),'Falha legada 404 deve ser reconhecida sem consulta pesada na abertura.');
  const state=publicAgendaStateFromRows_(published,legacy);
  assertEquals_('EXTERNAL_MISSING',state.code,'Agenda externa ausente deve possuir estado próprio.');
  assertEquals_('',state.agenda.publicUrl,'Link público morto não pode ser exposto ao cliente.');
  assertEquals_('',state.agenda.embedUrl,'Embed morto não pode ser exposto ao cliente.');
  const persist=String(publicAgendaPersistExternalMissing_);
  assertTrue_(persist.indexOf('EXTERNAL_MISSING')!==-1&&persist.indexOf("current.public_url=''")!==-1&&persist.indexOf("current.embed_url=''")!==-1,'Persistência do 404 deve limpar links e demover o estado operacional.');
}

/** R17: Agenda apagada fora do sistema só pode voltar por recriação explícita e conferida. */
function testR17PublicAgendaRecreationContract_() {
  const dispatch=String(publicAgendaExecutorDispatch_),exists=String(publicAgendaExecutorCheckExists_),check=String(checkPublicAgendaExternalExists_),recreate=String(recreatePublicAgenda);
  assertTrue_(dispatch.indexOf("action==='CHECK_EXISTS'")!==-1&&exists.indexOf('Calendar.Calendars.get')!==-1,'Executor deve oferecer verificação leve de existência da Agenda.');
  assertTrue_(check.indexOf("publicAgendaHandleRemoteFailure_")!==-1,'404 detectado pela verificação leve deve persistir o estado de Agenda externa ausente.');
  assertTrue_(recreate.indexOf("publicAgendaInvokeExecutor_('CREATE'")!==-1,'Recriação deve gerar uma nova Google Agenda, nunca reutilizar o ID morto.');
  assertTrue_(recreate.indexOf('current.google_calendar_id=externalId')!==-1&&recreate.indexOf('result.diagnostic&&result.diagnostic.identical')!==-1,'Novo ID e diagnóstico final devem ser persistidos juntos.');
  assertTrue_(recreate.indexOf('publicAgendaCleanupExternalCalendar_')!==-1&&recreate.indexOf('AGENDA_LINK_CHANGED')!==-1,'Concorrência/falha local deve possuir compensação e proteção contra troca de vínculo.');
  assertFalse_(String(publicAgendaStateFromRows_).indexOf("publicAgendaInvokeExecutor_('CREATE'")!==-1,'Abertura/derivação de estado nunca pode recriar Agenda automaticamente.');
}

/** R17: comunicação valida existência e identidade do link na prévia e novamente imediatamente antes do envio. */
function testR17PublicAgendaCommunicationLiveLinkGuardContract_() {
  const resolve=String(publicAgendaResolveCommunicationContext_),prepare=String(preparePublicAgendaCommunication),send=String(sendPublicAgendaCommunication);
  assertTrue_(resolve.indexOf('checkPublicAgendaExternalExists_')!==-1,'Prévia de comunicação deve verificar se a Agenda ainda existe.');
  assertTrue_(prepare.indexOf('googleCalendarId')!==-1&&prepare.indexOf('agendaVersion')!==-1,'Token de confirmação deve congelar a identidade da Agenda revisada.');
  assertTrue_(send.indexOf('AGENDA_LINK_CHANGED')!==-1&&send.indexOf('checkPublicAgendaExternalExists_')!==-1,'Envio deve rejeitar link trocado e revalidar a existência imediatamente antes do Gmail.');
  assertTrue_(send.indexOf('cache.remove(key)')!==-1,'Confirmação deve continuar sendo de uso único para evitar duplicação acidental.');
}

/** R17: ativação guiada cobre Cloud, três APIs, OAuth, permissão Apps Script e deployment sem esconder links. */
function testR17PublicAgendaGuidedCloudSetupContract_() {
  const activation=String(getPublicAgendaActivationStatus_),links=String(publicAgendaCloudConsoleLinks_),save=String(savePublicAgendaCloudProjectNumber),html=HtmlService.createHtmlOutputFromFile('index').getContent();
  ['script.googleapis.com','calendar-json.googleapis.com','gmail.googleapis.com'].forEach(function(service){assertTrue_(activation.indexOf(service)!==-1||links.indexOf(service)!==-1,'API obrigatória ausente no Wizard: '+service);});
  assertTrue_(activation.indexOf('cloudProjectNumber')!==-1&&save.indexOf('PUBLIC_AGENDA_CLOUD_PROJECT_NUMBER_PROPERTY')!==-1,'Wizard deve registrar/usar explicitamente o número do projeto Cloud.');
  assertTrue_(String(publicAgendaExecutorDispatch_).indexOf("action==='PREFLIGHT'")!==-1&&String(publicAgendaExecutorPreflight_).indexOf('Calendar.CalendarList.list')!==-1,'Verificação final deve testar a Calendar API no executor sem criar ou alterar agendas.');
  assertTrue_(String(publicAgendaExecutorPingCompatibility_).indexOf('EXECUTOR_CAPABILITIES_MISSING')!==-1&&html.indexOf('Gerenciar implantações → Editar → Versão: Nova versão → Implantar')!==-1,'Atualizações do sistema devem detectar deployment antigo e ensinar a atualizar a versão existente.');
  assertTrue_(links.indexOf("suffix=number?'?project='+encodeURIComponent(number):''")!==-1&&links.indexOf("authAudienceUrl:'https://console.cloud.google.com/auth/audience'+suffix")!==-1,'Links de API/Auth devem ser vinculados ao projeto informado.');
  ['publicAgendaCloudProjectNumber','publicAgendaOpenCloudCreateBtn','publicAgendaOpenAppsScriptApiBtn','publicAgendaOpenCalendarApiBtn','publicAgendaOpenGmailApiBtn','publicAgendaOpenAuthAudienceBtn','publicAgendaOpenScriptSettingsBtn','publicAgendaOpenDeploymentsBtn'].forEach(function(id){assertTrue_(html.indexOf('id="'+id+'"')!==-1,'Etapa/link explícito ausente no assistente: '+id);});
  assertTrue_(html.indexOf('Fazer depois / Fechar')!==-1,'Wizard deve permitir adiar uma integração complementar.');
  assertFalse_(html.indexOf('console.developers.google.com/start/api?hl=pt-br&id=script')!==-1,'Não pode restar link genérico de habilitação da Apps Script API.');
}

/** R17: Setup conclui a instalação mesmo sem Google Agenda e informa exatamente o que permanece disponível. */
function testR17SetupGracefulDegradationContract_() {
  const setup=String(runSetupMenuStep_),activation=String(getPublicAgendaActivationStatus_);
  assertTrue_(setup.indexOf('Instalação concluída. A integração Google Agenda pode ser configurada depois')!==-1,'Setup deve concluir sem transformar Google Agenda em requisito global.');
  assertTrue_(setup.indexOf('Criação, edição, retificação, finalização, publicação, prévia e PDF: disponíveis')!==-1,'Setup deve explicar quais funções locais permanecem disponíveis.');
  assertTrue_(setup.indexOf("Google Agenda e comunicações relacionadas: ")!==-1,'Setup deve delimitar somente as funções dependentes da integração externa.');
  assertTrue_(activation.indexOf('gracefulDegradation')!==-1&&activation.indexOf('installationCanFinish:true')!==-1,'Backend deve expor formalmente a degradação graciosa ao assistente.');
}

/** R17: Gmail API desativada vira orientação acionável sem invalidar a Agenda já criada. */
function testR17GmailApiRemediationContract_() {
  const send=String(sendPublicAgendaCommunication),html=HtmlService.createHtmlOutputFromFile('index').getContent();
  assertTrue_(send.indexOf("code:'GMAIL_API_DISABLED'")!==-1&&send.indexOf('requiresGmailApiEnablement:true')!==-1,'Falha de Gmail API deve possuir código/remediação própria.');
  assertTrue_(send.indexOf('actionUrl:links.gmailApiEnableUrl')!==-1,'Resposta deve fornecer o link direto de habilitação no projeto Cloud conhecido.');
  assertTrue_(send.indexOf('A Agenda Pública não foi alterada')!==-1,'Falha de comunicação deve afirmar que a Agenda Google foi preservada.');
  assertTrue_(html.indexOf('id="publicAgendaMailActionLink"')!==-1,'Modal de comunicação deve conseguir mostrar a ação direta retornada pelo backend.');
}

/** R17: UX diferencia remover assinatura de excluir a Agenda como proprietário. */
function testR17PublicAgendaOwnerDeletionUxContract_() {
  const html=HtmlService.createHtmlOutputFromFile('index').getContent(),begin=html.slice(html.indexOf('function beginPublicAgendaDelete'),html.indexOf('function cancelPublicAgendaDelete'));
  assertTrue_(begin.indexOf('para todos os assinantes')!==-1,'Confirmação deve avisar que a exclusão pelo proprietário afeta todos os assinantes.');
  assertTrue_(html.indexOf('excluir a agenda diretamente no Google como proprietário a apaga para todos os assinantes')!==-1,'Painel deve orientar o proprietário a encerrar a publicação pelo sistema.');
  assertTrue_(begin.indexOf("state.publicAgendaData.state.code==='EXTERNAL_MISSING'")!==-1,'Se a Agenda já foi apagada fora do sistema, exclusão deve explicar que removerá somente o vínculo local restante.');
}

/** R18: recriação usa o RPC estável createPublicAgenda para não depender de novo entrypoint no cliente. */
function testR18PublicAgendaStableRecreateRpcContract_() {
  const create=String(createPublicAgenda),facade=String(PublicAgenda.recreate),html=HtmlService.createHtmlOutputFromFile('index').getContent();
  const start=html.indexOf('function recreatePublicAgendaFromPanel'),end=html.indexOf('function updatePublicAgendaFromPanel'),flow=html.slice(start,end);
  assertTrue_(create.indexOf('return recreatePublicAgenda(id,progressToken)')!==-1,'createPublicAgenda deve delegar internamente à recriação quando o vínculo externo estiver ausente.');
  assertTrue_(facade.indexOf('createPublicAgenda')!==-1,'Fachada de recriação deve usar o entrypoint estável createPublicAgenda.');
  assertTrue_(flow.indexOf('.createPublicAgenda(project.id,token)')!==-1,'Cliente deve chamar o RPC estável createPublicAgenda na recriação.');
  assertFalse_(flow.indexOf('.recreatePublicAgenda(')!==-1,'Cliente não pode depender diretamente do novo RPC recreatePublicAgenda.');
}

/** R14: ativação institucional é guiada; endpoint só existe no bloco técnico avançado. */
function testR14GuidedPublicAgendaActivationContract_() {
  const html=HtmlService.createHtmlOutputFromFile('index').getContent(),createFlow=html.slice(html.indexOf('function createPublicAgendaFromPanel'),html.indexOf('function updatePublicAgendaFromPanel'));
  ['publicAgendaActivateBtn','publicAgendaActivationModal','publicAgendaActivationCheckBtn','publicAgendaOpenDeploymentsBtn','publicAgendaActivationRemediation','publicAgendaOpenOAuthAuthorizationBtn','publicAgendaOpenScriptSettingsBtn','publicAgendaOpenApiLibraryBtn','publicAgendaTechnicalDetails'].forEach(function(id){assertTrue_(html.indexOf('id="'+id+'"')!==-1,'Ativação guiada ausente: '+id);});
  assertTrue_(createFlow.indexOf('openPublicAgendaActivationModal()')!==-1,'Criar Agenda sem integração deve conduzir ao Wizard, não ignorar o clique.');
  assertFalse_(html.indexOf('O executor institucional ainda não foi validado')!==-1,'UX normal não deve expor a antiga mensagem de executor.');
  const technical=html.indexOf('id="publicAgendaTechnicalDetails"'),endpoint=html.indexOf('id="publicAgendaExecutorUrl"');
  assertTrue_(technical!==-1&&endpoint>technical,'Endpoint manual deve existir somente dentro da área técnica avançada.');
  ['getActivationStatus','activateIntegration'].forEach(function(method){assertTrue_(typeof PublicAgenda[method]==='function','Fachada deve expor '+method+' para ativação guiada.');});
  assertTrue_(String(publicAgendaListDeploymentsViaApi_).indexOf('requiresAppsScriptApiAccess:true')!==-1,'Bloqueio da consulta pelo Google deve virar orientação guiada, não erro técnico opaco.');
  assertTrue_(html.indexOf('id="publicAgendaActivationRemediationTitle"')!==-1&&html.indexOf('Ação necessária do Google')!==-1,'Wizard deve reservar uma etapa contextual para a autorização extraordinária somente quando a descoberta automática precisar dela.');
}

/** R14: descoberta só aceita deployment anônimo que execute como o implantador e ainda exige protocolo HMAC válido. */
function testR14ExecutorDiscoverySecurityContract_() {
  const candidate=String(publicAgendaExecutorCandidateFromDeployment_),discover=String(discoverAndActivatePublicAgendaExecutor),invoke=String(publicAgendaInvokeExecutorUrl_);
  assertTrue_(candidate.indexOf("executeAs!=='USER_DEPLOYING'")!==-1&&candidate.indexOf("access!=='ANYONE_ANONYMOUS'")!==-1,'Descoberta deve rejeitar deployment com identidade/acesso incompatíveis.');
  assertTrue_(discover.indexOf('publicAgendaExecutorPingCompatibility_')!==-1,'Deployment encontrado só pode ser aceito após PING compatível com protocolo e release atuais.');
  assertTrue_(String(publicAgendaExecutorPingCompatibility_).indexOf('EXECUTOR_VERSION_MISMATCH')!==-1,'Executor de release diferente deve ser rejeitado explicitamente.');
  assertTrue_(invoke.indexOf('publicAgendaSignRequest_')!==-1,'Descoberta não pode enfraquecer assinatura HMAC/anti-replay do executor.');
  assertTrue_(String(publicAgendaListDeploymentsViaApi_).indexOf('ScriptApp.getOAuthToken()')!==-1,'Consulta de deployments deve ocorrer no backend com token do Superusuário, nunca no cliente.');
}

/** R22: deployment compartilhado mantém POST institucional isolado e GET protegido por autenticação interativa. */
function testR14ExecutorSurfaceIsolationContract_() {
  const entry=String(doGet),dispatch=String(doPost);
  assertTrue_(entry.indexOf("createHtmlOutputFromFile('auth')")!==-1&&entry.indexOf('validateAuthAccessToken_')===-1,'GET deve expor somente a tela de login e nunca inferir identidade do navegador.');
  assertTrue_(String(getAuthenticatedApplicationHtml).indexOf('validateAuthAccessToken_')!==-1&&String(getAuthenticatedApplicationHtml).indexOf('createApplicationHtml_')!==-1,'Interface completa deve ser entregue somente após validação do token próprio.');
  assertTrue_(dispatch.indexOf('publicAgendaVerifyExecutorRequest_')!==-1,'POST do serviço deve continuar protegido por assinatura/anti-replay.');
  assertTrue_(String(publicAgendaExecutorDispatch_).indexOf('appVersion:String(APP_VERSION')!==-1,'PING deve identificar a release executada pelo serviço.');
}

/** R14: todos os modelos institucionais apontam também para o calendário oficial e a migração é idempotente. */
function testR14OfficialCalendarReferenceContract_() {
  const defs=publicAgendaDefaultTemplateDefinitions_();
  assertEquals_(4,defs.length,'Devem existir quatro templates institucionais padrão.');
  defs.forEach(function(def){assertTrue_(String(def.html_template).indexOf('https://iftm.edu.br/calendarios')!==-1,'Template '+def.type+' deve informar o endereço institucional.');assertTrue_(String(def.text_template).indexOf('https://iftm.edu.br/calendarios')!==-1,'Versão texto de '+def.type+' deve informar o endereço institucional.');});
  const once=publicAgendaEnsureOfficialCalendarReference_('<p>Teste</p>','Teste'),twice=publicAgendaEnsureOfficialCalendarReference_(once.html,once.text);
  assertTrue_(once.changed,'Migração deve inserir a referência quando ausente.');assertFalse_(twice.changed,'Migração da referência institucional deve ser idempotente.');
  assertTrue_(String(seedPublicAgendaModule_).indexOf('officialReferenceAdded')!==-1,'Setup deve migrar templates existentes sem exigir restauração manual.');
}

/** R14: esta rodada exige migração PV19 para reparar bases já instaladas. */
function testR14SchemaMigrationContract_() {
  assertTrue_(Number((String(SCHEMA_VERSION).match(/pv(\d+)$/)||[])[1]||0)>=19,'R14 exige schema PV19 ou posterior; releases posteriores devem preservar a migração.');
  const setup=String(runSetupMenuStep_);
  assertTrue_(setup.indexOf('Retificações legadas reparadas')!==-1&&setup.indexOf('Templates com referência institucional adicionada')!==-1,'Setup deve reportar reparo de retificações e migração dos templates.');
}
