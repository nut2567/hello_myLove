export const updatedAt = "Structure.text10May2026";

export const currentStack = [
  {
    label: "Next.js",
    value: "16.2.4",
    detail:
      "Structure.usesAppRouterTheSiteRouteGroupDynamicImportsAnd",
  },
  {
    label: "React",
    value: "19.2.4",
    detail:
      "Structure.routesPrimarilyUseServerComponentsWithInteractiveGamesInClient",
  },
  {
    label: "Three.js",
    value: "0.182.0",
    detail: "Structure.theWebGLEngineFor3DScenesInRobotDragGameV2",
  },
  {
    label: "React Three Fiber",
    value: "9.6.1",
    detail:
      "Structure.buildsThreeJsScenesAsReactComponentsUsingCanvasMesh",
  },
  {
    label: "Drei",
    value: "10.7.7",
    detail:
      "Structure.providesHelpersSuchAsOrbitControlsEnvironmentHtmlAndContactShadows",
  },
  {
    label: "Tailwind CSS",
    value: "4",
    detail: "Structure.usesUtilityClassesAndDesignTokensFromSrcAppGlobals",
  },
];

export const routes = [
  {
    path: "/th",
    file: "src/app/(site)/th/page.tsx",
    detail: "Structure.theThaiHomePageWithHeartsLeadingToTheA",
  },
  {
    path: "/th/structure",
    file: "src/app/(site)/th/structure/page.tsx",
    detail: "Structure.thePageYouAreReadingDescribingTheCurrentProjectStructure",
  },
  {
    path: "/th/RobotDragGame",
    file: "src/app/(site)/th/RobotDragGame/page.tsx",
    detail:
      "Structure.loadsTheGameWithNextDynamicAndDisablesSSRBecause",
  },
  {
    path: "/[[...slug]]",
    file: "src/app/(site)/[[...slug]]/page.tsx",
    detail: "Structure.aCatchAllRouteForPathsWithoutADedicatedRoute",
  },
];

export const robotGameFiles = [
  {
    file: "src/components/robot-drag-game/RobotDragGame.tsx",
    role: "Structure.versionSelector",
    detail:
      "Structure.aWrapperThatSwitchesBetweenV1AndV2UsingThe",
  },
  {
    file: "src/components/robot-drag-game/V1/RobotDragGameV1.tsx",
    role: "Structure.originalVersion",
    detail:
      "Structure.a2DPixelRobotGameUsingTheDOMPointerEvents",
  },
  {
    file: "src/components/robot-drag-game/V2/RobotDragGameV2.tsx",
    role: "Structure.latestVersion",
    detail:
      "Structure.a3DReactThreeFiberGameWithAnArenaRobots",
  },
];

export const v2Flow = [
  "Structure.robotdraggamev2HoldsDifficultyRobotPositionsTheTargetRescuedCountAnd",
  "Structure.canvasCreatesTheWebGLSceneWithACameraLightingFog",
  "Structure.robotarenaHandlesAutomaticMovementDraggingTargetDistanceChecksAndDocking",
  "Structure.robotmodelBuildsRobotsFromBoxesSpheresAndCylindersWithUseFrame",
  "Structure.targetbeaconDisplaysALitRotating3DRingToMarkThe",
  "Structure.orbitcontrolsRotatesTheCameraAndIsTemporarilyDisabledWhileDragging",
];

export const v2ModelEditNotes = [
  {
    title: "Structure.changeRobotGeometry",
    target: "Structure.functionRobotModel",
    detail:
      "Structure.editJSXInRobotModelTheMeshBoxGeometrySphereGeometryAndCylinderGeometry",
  },
  {
    title: "Structure.changeIndividualRobotColors",
    target: "Structure.robotconfigs",
    detail:
      "Structure.editPrimarySecondaryAndEmissiveInRobotConfigsToChangeColors",
  },
  {
    title: "Structure.changeModelAnimations",
    target: "Structure.useframeInRobotModel",
    detail:
      "Structure.adjustBobbingDragScalingHeadRotationAndPositionInterpolationTo",
  },
  {
    title: "Structure.changeRobotPositionsAndMovement",
    target: "Structure.robotarena",
    detail:
      "Structure.editRobotArenaForDraggingWalkingSpeedBoundaryCollisionsRescueLogic",
  },
];

export const v2FunctionMap = [
  {
    name: "Structure.robotdraggamev2",
    role: "Structure.mainGameComponent",
    detail:
      "Structure.holdsGameStateAndComposesCanvasLightingTheCameraRobotArena",
  },
  {
    name: "Structure.robotarena",
    role: "Structure.text3dGameplayController",
    detail:
      "Structure.usesUseThreeAndUseFrameForPointerRaycastingTheDragPlane",
  },
  {
    name: "Structure.robotmodel",
    role: "Structure.text3dRobotModel",
    detail:
      "Structure.theMainPlaceToChangeRobotAppearanceItContainsMeshes",
  },
  {
    name: "Structure.arenafloor",
    role: "Structure.arenaFloorAndDocks",
    detail:
      "Structure.createsTheGridFloorArenaBordersAndDocksDockColors",
  },
  {
    name: "Structure.targetbeacon",
    role: "Structure.robotDestination",
    detail:
      "Structure.createsALit3DTargetRingThatRotatesAndScales",
  },
];

export const v2FileSections = [
  {
    name: "Structure.useClient",
    role: "Structure.marksTheFileAsANextJsClientComponent",
    detail:
      "Structure.requiredBecauseThisFileUsesUseStateUseEffectPointerEventsWebGL",
  },
  {
    name: "Structure.importsFromReactThreeFiber",
    role: "Structure.core3DSceneTools",
    detail:
      "Structure.canvasCreatesTheWebGLSurfaceUseFrameRunsEveryAnimationFrame",
  },
  {
    name: "Structure.importsFromReactThreeDrei",
    role: "Structure.threeJsHelpers",
    detail:
      "Structure.environmentSuppliesLightingOrbitControlsRotatesTheCameraHtmlPlacesDOM",
  },
  {
    name: "Structure.importsFromThree",
    role: "Structure.threeJsBaseClasses",
    detail:
      "Structure.colorSetsTheBackgroundMathUtilsInterpolatesAnimationPlaneDefinesThe",
  },
];

export const v2TypeMap = [
  {
    name: "Structure.robotid",
    detail:
      "Structure.aUnionOfTheFiveRobotIDsEnablingTypeSafe",
  },
  {
    name: "Structure.difficulty",
    detail:
      "Structure.theEasyMediumAndHardDifficultyUnionUsedAsKeys",
  },
  {
    name: "Structure.robotconfig",
    detail:
      "Structure.robotIdentityIDNamePrimarySecondaryAndEmissiveColorsPlus",
  },
  {
    name: "Structure.robotstate",
    detail:
      "Structure.oneRobotSStateXZPositionYawAndCaptured",
  },
  {
    name: "Structure.robotstates",
    detail:
      "Structure.aRecordMappingRobotIdToRobotStateHoldingEveryRobotS",
  },
  {
    name: "Structure.robotmotionRobotMotions",
    detail:
      "Structure.automaticMovementDataXZVelocityDirectionChangeTimeAnd",
  },
  {
    name: "Structure.targetpoint",
    detail:
      "Structure.anArenaFloorPositionUsingXAndZBecauseObjects",
  },
  {
    name: "Structure.dragsession",
    detail:
      "Structure.theRobotIDAndPointerOffsetForADragPreventing",
  },
  {
    name: "Structure.difficultysettings",
    detail:
      "Structure.gameplaySettingsForEachDifficultySpeedTargetRadiusVisibilityFlash",
  },
];

export const v2ConstantMap = [
  {
    name: "Structure.arenaWIDTHARENADEPTH",
    detail:
      "Structure.arenaSizeAlongXAndZUsedForTheFloor",
  },
  {
    name: "Structure.halfWIDTHHALFDEPTH",
    detail:
      "Structure.halfTheArenaDimensionsSimplifyingBoundaryCalculations",
  },
  {
    name: "Structure.robotRADIUS",
    detail:
      "Structure.robotClearanceUsedToClampPositionsInsideTheArena",
  },
  {
    name: "Structure.robotCOUNT",
    detail:
      "Structure.theTotalRobotCountUsedForDockPlacementAndCompletion",
  },
  {
    name: "Structure.robotconfigs",
    detail:
      "Structure.theFiveRobotConfigurationsDefiningEachNameColorAndAnimation",
  },
  {
    name: "Structure.difficulties",
    detail:
      "Structure.difficultySettingsForRobotSpeedTargetRadiusAndTargetVisibility",
  },
  {
    name: "Structure.difficultyorder",
    detail:
      "Structure.theOrderOfDifficultyButtonsInTheGameToolbar",
  },
];

export const v2HelperMap = [
  {
    name: "Structure.randombetweenMinMax",
    detail:
      "Structure.returnsARandomDecimalBetweenMinAndMaxForPositions",
  },
  {
    name: "Structure.clampValueMinMax",
    detail:
      "Structure.constrainsAValueToARangeKeepingWalkingAndDragged",
  },
  {
    name: "Structure.distance2dAB",
    detail:
      "Structure.measuresXZDistanceToCheckRescueAndProximityReveal",
  },
  {
    name: "Structure.getnow",
    detail:
      "Structure.returnsPerformanceNowWhenAvailableOtherwise0AllowingEnvironmentsWithout",
  },
  {
    name: "Structure.createpointMargin09",
    detail:
      "Structure.createsARandomTargetPositionWithAMarginFromThe",
  },
  {
    name: "Structure.createrobotstates",
    detail:
      "Structure.randomizesTheInitialPositionAndYawOfEveryRobotAt",
  },
  {
    name: "Structure.createrobotmotionNowDifficulty",
    detail:
      "Structure.createsMotionForOneRobotWithAn18ChanceTo",
  },
  {
    name: "Structure.createrobotmotionsNowDifficulty",
    detail:
      "Structure.createsMotionForEveryRobotByIteratingRobotConfigsAndCalling",
  },
  {
    name: "Structure.createflashscheduleNowDifficulty",
    detail:
      "Structure.schedulesTargetBeaconVisibilityByDifficultyEasyUsesAnInfinite",
  },
  {
    name: "Structure.getdockpointIndex",
    detail:
      "Structure.calculatesADockPositionForARescuedRobotAtThe",
  },
  {
    name: "Structure.countcapturedStates",
    detail:
      "Structure.countsRobotsWithCapturedTrueForTheRescuedCountAnd",
  },
];

export const v2NestedFunctionMap = [
  {
    name: "Structure.finishdrag",
    owner: "RobotArena",
    detail:
      "Structure.onPointerupOrPointercancelEndsDraggingAndChecksTargetDistance",
  },
  {
    name: "Structure.handlerobotpointerdownIdEvent",
    owner: "RobotArena",
    detail:
      "Structure.startsDraggingA3DRobotStopsEventBubblingStoresIts",
  },
  {
    name: "Structure.restartgameNextDifficultyDifficulty",
    owner: "RobotDragGameV2",
    detail:
      "Structure.resetsDifficultyRobotPositionsTheTargetDraggingRescuedCountAnd",
  },
];

export const v2StateMap = [
  {
    name: "Structure.difficulty2",
    detail:
      "Structure.currentDifficultySelectingSpeedTargetRadiusAndTargetVisibility",
  },
  {
    name: "Structure.robotstates2",
    detail:
      "Structure.everyRobotSPositionOrientationAndCapturedStatusDrivingRobotModel",
  },
  {
    name: "Structure.target",
    detail:
      "Structure.theCurrentDestinationForDraggedRobots",
  },
  {
    name: "Structure.targetvisible",
    detail:
      "Structure.controlsTargetBeaconVisibilityAlwaysVisibleOnEasyFlashingOrRevealed",
  },
  {
    name: "Structure.draggedid",
    detail:
      "Structure.theDraggedRobotIDOrNullWhenIdleTemporarilyDisables",
  },
  {
    name: "Structure.capturedcount",
    detail:
      "Structure.theRescuedRobotCountShownAsRescuedX5",
  },
  {
    name: "Structure.iscomplete",
    detail:
      "Structure.completionStateStoppingRobotArenaLogicAndOpeningTheMissionComplete",
  },
  {
    name: "Structure.restartkey",
    detail:
      "Structure.anIncrementingRestartCounterThatTriggersRobotArenaEffectsEvenWhen",
  },
];

export const v2RefMap = [
  {
    name: "Structure.statesrefTargetRefDifficultyRef",
    detail:
      "Structure.storesCurrentStateForUseFrameAndEventCallbacksToAvoid",
  },
  {
    name: "Structure.targetvisiblerefIsCompleteRefDraggedIdRef",
    detail:
      "Structure.mirrorsStateNeededByFrameLoopsOrCallbacksWithoutWaiting",
  },
  {
    name: "Structure.dragref",
    detail:
      "Structure.theCurrentDragSessionAValueMeansARobotIs",
  },
  {
    name: "Structure.pointerworldref",
    detail:
      "Structure.aReusedVector3HoldingThePointerPositionAfterRaycastingOnto",
  },
  {
    name: "Structure.dragplane",
    detail:
      "Structure.aHorizontalPlaneAtY0MappingScreenPointerCoordinates",
  },
  {
    name: "Structure.motionsref",
    detail:
      "Structure.storesAndUpdatesAutomaticMovementForEveryRobotEachFrame",
  },
  {
    name: "Structure.flashref",
    detail:
      "Structure.storesTargetBeaconFlashTimingIncludingNextAtAndVisibleUntil",
  },
];

export const workspaceTree = `src/
  app/
    (site)/
      th/
        page.tsx
        structure/page.tsx
        RobotDragGame/page.tsx
      [[...slug]]/page.tsx
    globals.css
    layout.tsx
  components/
    RobotDragGame.tsx
    PixelRobot.tsx
    robot-drag-game/
      RobotDragGame.tsx
      V1/RobotDragGameV1.tsx
      V1/PixelRobot.tsx
      V2/RobotDragGameV2.tsx
    ShipScene.tsx
    layout/site-shell.tsx
    ui/
    home/
  lib/
    site.ts
  proxy.ts`;
